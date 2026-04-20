import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatApi } from "@/src/api/client";
import { useUser } from "@/src/context/UserContext";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { ChatMessagesSkeleton } from "@/src/components/Skeleton";
import type { ChatMessageResponse } from "@/src/api/generated/models/ChatMessageResponse";
import { resolveImageUrl } from "@/src/helpers/images";

type ListItem =
  | { type: "date"; key: string; label: string }
  | {
      type: "message";
      key: string;
      message: ChatMessageResponse;
      isMe: boolean;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
      showTime: boolean;
    };

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Idag";
  if (isSameDay(date, yesterday)) return "Igår";

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString("sv-SE", { weekday: "long" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("sv-SE", { day: "numeric", month: "long" });
  }
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatConversationScreen() {
  const router = useRouter();
  const { chatId, taskId, name, taskTitle, otherUserId, otherUserImage } = useLocalSearchParams<{
    chatId: string;
    taskId?: string;
    name?: string;
    taskTitle?: string;
    otherUserId?: string;
    otherUserImage?: string;
  }>();
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();


  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadMessages(after?: Date) {
    if (!chatId) return;
    try {
      const res = await chatApi.getMessages({ chatId, after });
      if (after) {
        if (res.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = res.filter((m) => !existingIds.has(m.id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        }
      } else {
        setMessages(res);
      }
    } catch (e) {
      console.log("Failed to load messages:", e);
    }
  }

  async function markChatAsRead() {
    if (!chatId) return;
    try {
      const stored = await AsyncStorage.getItem("chat_last_read");
      const map = stored ? JSON.parse(stored) : {};
      map[chatId] = new Date().toISOString();
      await AsyncStorage.setItem("chat_last_read", JSON.stringify(map));
    } catch {}
  }

  useEffect(() => {
    loadMessages().finally(() => {
      setLoading(false);
      markChatAsRead();
    });

    pollRef.current = setInterval(() => {
      setMessages((prev) => {
        const lastMsg = prev.length > 0 ? prev[prev.length - 1] : null;
        loadMessages(lastMsg?.createdAt ?? undefined);
        return prev;
      });
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatId]);

  async function handleSend() {
    if (!chatId || !text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage({
        chatId,
        sendMessageRequest: { content: text.trim() },
      });
      setMessages((prev) => [...prev, msg]);
      setText("");
      markChatAsRead();
    } catch (e) {
      console.log("Send error:", e);
    } finally {
      setSending(false);
    }
  }

  const listItems = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    let lastDate: Date | null = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.createdAt) continue;
      const msgDate = msg.createdAt;
      const isMe = msg.senderId === user?.id;

      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        items.push({
          type: "date",
          key: `date-${msgDate.toISOString()}`,
          label: dayLabel(msgDate),
        });
      }
      lastDate = msgDate;

      const prev = messages[i - 1];
      const next = messages[i + 1];

      const prevSameSender =
        prev && prev.senderId === msg.senderId && prev.createdAt && isSameDay(prev.createdAt, msgDate);
      const nextSameSender =
        next && next.senderId === msg.senderId && next.createdAt && isSameDay(next.createdAt, msgDate);

      const isFirstInGroup = !prevSameSender;
      const isLastInGroup = !nextSameSender;

      // Show time only when there's a significant gap (15+ min) to the next message,
      // or it's the very last message in the conversation
      let showTime = !next;
      if (!showTime && next && next.createdAt) {
        const gap = (next.createdAt.getTime() - msgDate.getTime()) / 60000;
        if (gap >= 15) showTime = true;
      }

      items.push({
        type: "message",
        key: msg.id ?? `m-${i}`,
        message: msg,
        isMe,
        isFirstInGroup,
        isLastInGroup,
        showTime,
      });
    }

    return items;
  }, [messages, user?.id]);

  const lastMyMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === user?.id) return messages[i].id;
    }
    return null;
  }, [messages, user?.id]);

  function renderItem({ item }: { item: ListItem }) {
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>{item.label}</Text>
        </View>
      );
    }

    const { message, isMe, isFirstInGroup, isLastInGroup, showTime } = item;

    const bubbleStyle = [
      styles.bubble,
      isMe ? styles.bubbleMe : styles.bubbleThem,
      isMe
        ? {
            borderTopRightRadius: isFirstInGroup ? 18 : 6,
            borderBottomRightRadius: isLastInGroup ? 18 : 6,
          }
        : {
            borderTopLeftRadius: isFirstInGroup ? 18 : 6,
            borderBottomLeftRadius: isLastInGroup ? 18 : 6,
          },
      { marginTop: isFirstInGroup ? 6 : 2 },
    ];

    return (
      <View style={isMe ? styles.rowMe : styles.rowThem}>
        <View style={bubbleStyle}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {message.content}
          </Text>
        </View>
        {showTime && message.createdAt && (
          <Text style={[styles.timeBelow, isMe ? styles.timeBelowMe : styles.timeBelowThem]}>
            {timeLabel(message.createdAt)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        {otherUserImage ? (
          <Image
            source={{ uri: resolveImageUrl(otherUserImage)! }}
            style={styles.headerAvatarImage}
          />
        ) : (
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {(name ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Pressable
          style={styles.headerInfo}
          onPress={() => {
            if (otherUserId) router.push(`/public-user?id=${otherUserId}` as any);
          }}
          disabled={!otherUserId}
        >
          <Text style={styles.headerName} numberOfLines={1}>{name ?? "Chatt"}</Text>
          {taskTitle && (
            <Text style={styles.headerTask} numberOfLines={1}>{taskTitle}</Text>
          )}
        </Pressable>
        <Text style={styles.headerChevron}>›</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <ChatMessagesSkeleton />
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...listItems].reverse()}
            inverted
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.messageList}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Inga meddelanden ännu</Text>
                <Text style={styles.emptySubtext}>Skriv ett meddelande för att starta konversationen</Text>
              </View>
            }
          />
        )}

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Skicka ett meddelande"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              maxLength={1000}
              editable={!sending}
              onSubmitEditing={handleSend}
              submitBehavior="submit"
            />
          </View>
          {text.trim().length > 0 && (
            <Pressable
              onPress={handleSend}
              disabled={sending}
              style={({ pressed }) => [
                styles.sendButton,
                sending && { opacity: 0.4 },
                pressed && !sending && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.sendArrow}>↑</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.card,
    },
    backButton: {
      padding: 4,
      marginRight: 8,
    },
    backArrow: {
      fontSize: 22,
      color: colors.accent,
      fontWeight: "600",
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    headerAvatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
    },
    headerAvatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    headerInfo: {
      flex: 1,
    },
    headerName: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    headerTask: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: "500",
      marginTop: 1,
    },
    headerChevron: {
      fontSize: 26,
      color: colors.textMuted,
      marginLeft: 8,
      marginRight: 4,
    },
    messageList: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexGrow: 1,
    },
    dateSeparator: {
      alignItems: "center",
      marginVertical: 12,
    },
    dateSeparatorText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      backgroundColor: colors.cardElevated,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: "hidden",
      textTransform: "capitalize",
    },
    rowMe: {
      alignItems: "flex-end",
    },
    rowThem: {
      alignItems: "flex-start",
    },
    bubble: {
      maxWidth: "78%",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    bubbleMe: {
      backgroundColor: colors.accent,
    },
    bubbleThem: {
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
    },
    bubbleTextMe: {
      color: "#fff",
    },
    bubbleTextThem: {
      color: colors.textPrimary,
    },
    timeBelow: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 3,
      marginBottom: 4,
    },
    timeBelowMe: {
      marginRight: 4,
    },
    timeBelowThem: {
      marginLeft: 4,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.card,
      gap: 8,
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      minHeight: 44,
      justifyContent: "center",
    },
    input: {
      fontSize: 15,
      color: colors.textPrimary,
      maxHeight: 100,
      paddingVertical: Platform.OS === "ios" ? 10 : 6,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    sendArrow: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "700",
      marginTop: -2,
    },
  });
}
