import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { blockApi } from "@/src/api/client";
import type { BlockedUserDto } from "@/src/api/generated/models/BlockedUserDto";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { useBlockedUsers } from "@/src/context/BlockedUsersContext";
import { resolveImageUrl } from "@/src/helpers/images";

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { removeBlocked } = useBlockedUsers();

  const [users, setUsers] = useState<BlockedUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const loadBlocked = useCallback(async () => {
    try {
      const res = await blockApi.listBlocked();
      setUsers(res);
    } catch (e) {
      console.log("Failed to load blocked users:", e);
    }
  }, []);

  useEffect(() => {
    loadBlocked().finally(() => setLoading(false));
  }, [loadBlocked]);

  async function onRefresh() {
    setRefreshing(true);
    await loadBlocked();
    setRefreshing(false);
  }

  function confirmUnblock(item: BlockedUserDto) {
    if (!item.userId) return;
    const title = "Avblockera";
    const message = item.name
      ? `Vill du avblockera ${item.name}?`
      : "Vill du avblockera denna användare?";
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) doUnblock(item.userId);
    } else {
      Alert.alert(title, message, [
        { text: "Avbryt", style: "cancel" },
        { text: "Avblockera", onPress: () => doUnblock(item.userId!) },
      ]);
    }
  }

  async function doUnblock(userId: string) {
    setUnblockingId(userId);
    try {
      await blockApi.unblockUser({ userId });
      removeBlocked(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (e) {
      console.log("Unblock failed:", e);
      const msg = "Kunde inte avblockera användaren. Försök igen.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setUnblockingId(null);
    }
  }

  function renderUser({ item }: { item: BlockedUserDto }) {
    return (
      <View style={styles.row}>
        {item.profileImageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(item.profileImageUrl)! }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {(item.name ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name ?? "Okänd användare"}</Text>
          <Text style={styles.rowMeta}>Blockerad</Text>
        </View>
        <Pressable
          onPress={() => confirmUnblock(item)}
          disabled={unblockingId === item.userId}
          style={({ pressed }) => [
            styles.unblockButton,
            pressed && { opacity: 0.7 },
            unblockingId === item.userId && { opacity: 0.5 },
          ]}
        >
          {unblockingId === item.userId ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.unblockButtonText}>Avblockera</Text>
          )}
        </Pressable>
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
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
        <Text style={styles.title}>Blockerade</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId ?? Math.random().toString()}
          renderItem={renderUser}
          contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={require("@/assets/images/blocked-user-icon.png")}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Inga blockerade användare</Text>
              <Text style={styles.emptySubtitle}>
                Användare du blockerar visas här
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      marginBottom: 12,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    list: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    emptyContainer: {
      flexGrow: 1,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarFallbackText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    rowInfo: {
      flex: 1,
    },
    rowName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    rowMeta: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    unblockButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.accent,
      minWidth: 100,
      alignItems: "center",
    },
    unblockButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.accent,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 56,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 200,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      tintColor: colors.accent,
      marginBottom: 16,
      opacity: 0.6,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}
