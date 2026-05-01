import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { userApi } from "@/src/api/client";
import type { UserReviewDto } from "@/src/api/generated/models/UserReviewDto";
import { StarRating } from "@/src/components/StarRating";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { resolveImageUrl } from "@/src/helpers/images";
import { timeAgo } from "@/src/helpers/time";

export default function UserReviewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [reviews, setReviews] = useState<UserReviewDto[]>([]);
  const [stats, setStats] = useState<{ average: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!id) return;
    userApi
      .getPublicUser({ id })
      .then((u) => setStats({ average: u.ratingAverage ?? 0, count: u.ratingCount ?? 0 }))
      .catch(() => {});
  }, [id]);

  const loadReviews = useCallback(
    async (targetPage = 0) => {
      if (!id) return;
      try {
        const res: any = await userApi.getUserReviews({
          id,
          pageable: { page: targetPage, size: 20, sort: ["completedAt,desc"] },
        } as any);
        const items: UserReviewDto[] = res?.content ?? [];
        if (targetPage === 0) {
          setReviews(items);
        } else {
          setReviews((prev) => [...prev, ...items]);
        }
        setPage(targetPage);
        setHasMore(!(res?.last ?? true));
      } catch (e) {
        console.log("Failed to load reviews:", e);
      }
    },
    [id]
  );

  useEffect(() => {
    loadReviews(0).finally(() => setLoading(false));
  }, [loadReviews]);

  async function onRefresh() {
    setRefreshing(true);
    await loadReviews(0);
    setRefreshing(false);
  }

  async function onEndReached() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadReviews(page + 1);
    setLoadingMore(false);
  }

  function renderReview({ item }: { item: UserReviewDto }) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          {item.reviewerImageUrl ? (
            <Image
              source={{ uri: resolveImageUrl(item.reviewerImageUrl)! }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {(item.reviewerName ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.rowInfo}>
            <View style={styles.topRow}>
              <Text style={styles.reviewerName} numberOfLines={1}>
                {item.reviewerName ?? "Borttagen användare"}
              </Text>
              {item.completedAt && (
                <Text style={styles.timeText}>{timeAgo(new Date(item.completedAt))}</Text>
              )}
            </View>
            {item.rating != null && (
              <StarRating rating={item.rating} showValue color="green" />
            )}
          </View>
        </View>

        {item.comment ? (
          <Text style={styles.comment} numberOfLines={3}>
            {item.comment}
          </Text>
        ) : null}

        {item.taskTitle && (
          <Text style={styles.taskTagText} numberOfLines={1}>
            {item.taskTitle}
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
          <Text style={styles.backText}>← Tillbaka</Text>
        </Pressable>
        <Text style={styles.title}>Omdömen</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.offerId ?? Math.random().toString()}
          renderItem={renderReview}
          contentContainerStyle={reviews.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            stats && stats.count > 0 ? (
              <View style={styles.summary}>
                <Text style={styles.summaryRating}>{stats.average.toFixed(1)}</Text>
                <StarRating rating={stats.average} showValue={false} color="green" />
                <Text style={styles.summaryCount}>
                  {stats.count === 1 ? "1 omdöme" : `baserat på ${stats.count} omdömen`}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Inga omdömen ännu</Text>
              <Text style={styles.emptySubtitle}>
                Omdömen visas när uppdrag har slutförts
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
      fontSize: 24,
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
      gap: 12,
    },
    summary: {
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      gap: 6,
    },
    summaryRating: {
      fontSize: 56,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: -1.5,
      lineHeight: 60,
    },
    summaryCount: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyContainer: {
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rowInfo: {
      flex: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 4,
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
      fontSize: 17,
      fontWeight: "700",
      color: "#fff",
    },
    reviewerName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
      flexShrink: 1,
      lineHeight: 16,
    },
    timeText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    comment: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginTop: 10,
    },
    taskTagText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 8,
      fontStyle: "italic",
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 200,
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
