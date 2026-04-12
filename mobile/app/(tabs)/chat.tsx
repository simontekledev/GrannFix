import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useUser } from "@/src/context/UserContext";
import { EmptyState } from "@/src/components/EmptyState";
import { chatApi } from "@/src/api/client";
import type { ChatSummaryResponse } from "@/src/api/generated/models/ChatSummaryResponse";
import { timeAgo } from "@/src/helpers/time";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { ChatListSkeleton } from "@/src/components/Skeleton";

export default function ChatListScreen() {
  const router = useRouter();
  const { loggedIn } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [chats, setChats] = useState<ChatSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const data = await chatApi.getMyChats();
      setChats(data);
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
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
          <Text style={styles.title}>Chatt</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <EmptyState
            iconImage={require("@/assets/images/chat-icon.png")}
            title="Logga in"
            subtitle="Logga in för att se dina chattar"
          />
        </View>
      </SafeAreaView>
    );
  }

  function renderChat({ item }: { item: ChatSummaryResponse }) {
    const initial = (item.otherPartyName ?? "?").charAt(0).toUpperCase();

    return (
      <Pressable
        style={({ pressed }) => [styles.chatRow, pressed && { opacity: 0.7 }]}
        onPress={() => router.push(`/chat-conversation?chatId=${item.id}&taskId=${item.taskId}&name=${encodeURIComponent(item.otherPartyName ?? "")}&taskTitle=${encodeURIComponent(item.taskTitle ?? "")}` as any)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatTopRow}>
            <Text style={styles.chatName} numberOfLines={1}>{item.otherPartyName}</Text>
            {item.lastMessageAt && (
              <Text style={styles.chatTime}>{timeAgo(item.lastMessageAt)}</Text>
            )}
          </View>
          {item.lastMessage && (
            <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessage}</Text>
          )}
        </View>
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
          <View style={{ paddingTop: 140 }}>
            <EmptyState
              iconImage={require("@/assets/images/chat-icon.png")}
              title="Inga chattar"
              subtitle="Här visas dina chattar när du har aktiva uppdrag"
            />
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
    list: {
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
  });
}
