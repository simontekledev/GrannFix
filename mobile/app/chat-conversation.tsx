import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { chatApi } from "@/src/api/client";
import { useUser } from "@/src/context/UserContext";
import type { ChatMessageResponse } from "@/src/api/generated/models/ChatMessageResponse";

export default function ChatConversationScreen() {
  const router = useRouter();
  const { chatId, name, taskTitle } = useLocalSearchParams<{
    chatId: string;
    name?: string;
    taskTitle?: string;
  }>();
  const { user } = useUser();

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

  useEffect(() => {
    loadMessages().finally(() => setLoading(false));

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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.log("Send error:", e);
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessageResponse }) {
    const isMe = item.senderId === user?.id;

    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
          {item.content}
        </Text>
        {item.createdAt && (
          <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
            {item.createdAt.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
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
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {(name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{name ?? "Chatt"}</Text>
          {taskTitle && (
            <Text style={styles.headerTask} numberOfLines={1}>{taskTitle}</Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#16A34A" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id ?? Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Inga meddelanden ännu</Text>
                <Text style={styles.emptySubtext}>Skriv ett meddelande för att starta konversationen</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Skriv ett meddelande..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
            maxLength={1000}
            editable={!sending}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={({ pressed }) => [
              styles.sendButton,
              (!text.trim() || sending) && styles.sendButtonDisabled,
              pressed && text.trim() && !sending && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.sendButtonText}>Skicka</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5faf2",
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
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backArrow: {
    fontSize: 22,
    color: "#16A34A",
    fontWeight: "600",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#111",
  },
  headerTask: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "500",
    marginTop: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: "#16A34A",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
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
    color: "#222",
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  bubbleTimeMe: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  bubbleTimeThem: {
    color: "#aaa",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f5faf2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#16A34A",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
