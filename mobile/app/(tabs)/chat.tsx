import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/src/context/UserContext";
import { chatApi } from "@/src/api/client";
import type { ChatSummaryResponse } from "@/src/api/generated/models/ChatSummaryResponse";
import { timeAgo } from "@/src/helpers/time";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { ChatListSkeleton } from "@/src/components/Skeleton";
import { resolveImageUrl } from "@/src/helpers/images";

export default function ChatListScreen() {
  const router = useRouter();
  const { loggedIn } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [chats, setChats] = useState<ChatSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastReadMap, setLastReadMap] = useState<Record<string, string>>({});

  const fetchChats = useCallback(async () => {
    try {
      const data = await chatApi.getMyChats();
      setChats(data);
      const stored = await AsyncStorage.getItem("chat_last_read");
      if (stored) setLastReadMap(JSON.parse(stored));
    } catch (e) {
      console.log("Failed to load chats:", e);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchChats().finally(() => setLoading(false));
    } else if (loggedIn === false) {
      setLoading(false);
    }
  }, [loggedIn, fetchChats]);

  useFocusEffect(
    useCallback(() => {
      if (loggedIn) fetchChats();
    }, [loggedIn, fetchChats])
  );

  async function onRefresh() {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ChatListSkeleton />
      </SafeAreaView>
    );
  }

  if (!loggedIn) {
    return (
      <View style={styles.safe}>
        <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
          <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
            <Text style={styles.title}>Chatt</Text>
          </LinearGradient>
        </SafeAreaView>
        <View style={[styles.centered, { flex: 1, paddingBottom: 80 }]}>
          <Image
            source={require("@/assets/images/chat-tab-icon.png")}
            style={styles.loginIcon}
            resizeMode="contain"
          />
          <Text style={styles.loginTitle}>Dina chattar</Text>
          <Text style={styles.loginSubtitle}>Se dina konversationer</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile?returnTo=chat" as any)}
            style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.loginButtonText}>Logga in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function markAsRead(chatId: string) {
    const updated = { ...lastReadMap, [chatId]: new Date().toISOString() };
    setLastReadMap(updated);
    await AsyncStorage.setItem("chat_last_read", JSON.stringify(updated));
  }

  function isUnread(item: ChatSummaryResponse): boolean {
    if (!item.id || !item.lastMessageAt) return false;
    const lastRead = lastReadMap[item.id];
    if (!lastRead) return true;
    return new Date(item.lastMessageAt).getTime() > new Date(lastRead).getTime();
  }

  function renderChat({ item }: { item: ChatSummaryResponse }) {
    const initial = (item.otherPartyName ?? "?").charAt(0).toUpperCase();
    const unread = isUnread(item);

    return (
      <Pressable
        style={({ pressed }) => [styles.chatRow, pressed && { opacity: 0.7 }]}
        onPress={() => {
          if (item.id) markAsRead(item.id);
          router.push(`/chat-conversation?chatId=${item.id}&taskId=${item.taskId}&name=${encodeURIComponent(item.otherPartyName ?? "")}&taskTitle=${encodeURIComponent(item.taskTitle ?? "")}&otherUserId=${item.otherPartyId ?? ""}&otherUserImage=${encodeURIComponent(item.otherPartyProfileImageUrl ?? "")}` as any);
        }}
      >
        {item.otherPartyProfileImageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(item.otherPartyProfileImageUrl)! }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.chatContent}>
          <View style={styles.chatTopRow}>
            <Text style={[styles.chatName, unread && styles.chatNameUnread]} numberOfLines={1}>{item.otherPartyName}</Text>
            {item.lastMessageAt && (
              <Text style={[styles.chatTime, unread && styles.chatTimeUnread]}>{timeAgo(item.lastMessageAt)}</Text>
            )}
          </View>
          {item.taskTitle && (
            <Text style={styles.chatTask} numberOfLines={1}>{item.taskTitle}</Text>
          )}
          {item.lastMessage && (
            <Text style={[styles.chatPreview, unread && styles.chatPreviewUnread]} numberOfLines={1}>{item.lastMessage}</Text>
          )}
        </View>
        {unread && <View style={styles.unreadDot} />}
      </Pressable>
    );
  }

  return (
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
        <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
          <Text style={styles.title}>Chatt</Text>
        </LinearGradient>
      </SafeAreaView>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderChat}
        contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={[styles.centered, { flex: 1, paddingBottom: 80 }]}>
            <Image
              source={require("@/assets/images/chat-tab-icon.png")}
              style={styles.loginIcon}
              resizeMode="contain"
            />
            <Text style={styles.loginTitle}>Inga chattar</Text>
            <Text style={styles.loginSubtitle}>Chattar skapas när du har aktiva uppdrag</Text>
          </View>
        }
      />
    </View>
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
    },
    headerRow: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 12,
    },
    title: {
      fontSize: 23,
      fontWeight: "700",
      color: colors.textPrimary,
      letterSpacing: -1.0,
    },
    loginIcon: {
      width: 70,
      height: 70,
      tintColor: colors.accent,
      marginBottom: 16,
    },
    loginTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 6,
    },
    loginSubtitle: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    loginButton: {
      marginTop: 16,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 48,
      alignItems: "center",
    },
    loginButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
    list: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    emptyList: {
      flex: 1,
    },
    chatRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    chatContent: {
      flex: 1,
    },
    chatTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    chatName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    chatTime: {
      fontSize: 12,
      color: colors.textMuted,
    },
    chatTask: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: "500",
      marginBottom: 2,
    },
    chatPreview: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 18,
    },
    chatNameUnread: {
      fontWeight: "700",
    },
    chatTimeUnread: {
      color: colors.accent,
      fontWeight: "600",
    },
    chatPreviewUnread: {
      color: colors.textPrimary,
      fontWeight: "500",
    },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
      marginLeft: 8,
    },
  });
}
