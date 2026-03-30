import { taskQueryApi, userApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import { EmptyState } from "@/src/components/EmptyState";
import { formatDistance, getDistanceKm, AREA_COORDS } from "@/src/helpers/distance";
import { timeAgo } from "@/src/helpers/time";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function UpptäckScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNearest, setSortNearest] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const fetchTasks = useCallback(async (cursor?: string) => {
    try {
      const res = await taskQueryApi.listTasks({
        cursor,
        limit: 20,
        status: "OPEN",
        city: undefined,
        area: undefined,
      });

      if (cursor) {
        setTasks((prev) => [...prev, ...(res.items ?? [])]);
      } else {
        setTasks(res.items ?? []);
      }
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore ?? false);
    } catch (e: any) {
      console.log("Failed to load tasks:", e);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    const isLoggedIn = !!token;
    setLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      try {
        const me = await userApi.getMe();
        setUserId(me.id ?? null);
      } catch (_) {}
    } else {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), checkAuth()]).finally(() => setLoading(false));
  }, [fetchTasks, checkAuth]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("access_token").then((token) => {
        const isLoggedIn = !!token;
        if (isLoggedIn !== loggedIn) {
          checkAuth();
        }
      });
    }, [loggedIn, checkAuth])
  );

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([fetchTasks(), checkAuth()]);
    setRefreshing(false);
  }

  async function onEndReached() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchTasks(nextCursor);
    setLoadingMore(false);
  }

  function renderTask({ item }: { item: TaskResponse }) {
    const distanceText = userLocation && item.area
      ? formatDistance(userLocation.lat, userLocation.lng, item.area)
      : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title ?? "Uppdrag"}
          </Text>
          {item.offeredPrice != null && (
            <Text style={styles.cardPrice}>{item.offeredPrice} kr</Text>
          )}
        </View>

        <View style={styles.cardMeta}>
          {item.area && (
            <View style={styles.areaBadge}>
              <Image source={require("@/assets/images/location-icon-transparent.png")} style={styles.locationIcon} />
              <Text style={styles.areaBadgeText}>{item.area}</Text>
            </View>
          )}
          {distanceText && (
            <Text style={styles.cardDistance}>· {distanceText}</Text>
          )}
        </View>

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {item.createdAt && (
          <Text style={styles.cardDate}>{timeAgo(item.createdAt)}</Text>
        )}

        <Pressable
          onPress={() => loggedIn ? null : router.push("/(tabs)/profile")}
          style={({ pressed, hovered }: any) => [
            styles.cardButton,
            hovered && styles.cardButtonHovered,
            pressed && !loggedIn && styles.cardButtonPressed,
          ]}
        >
          <Text style={styles.cardButtonText}>
            {loggedIn ? "Hjälp till" : "Logga in för att hjälpa till"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Image
          source={require("@/assets/images/grannfix-wordmark-transparent.png.png")}
          style={styles.wordmark}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Tillgängliga uppdrag</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Sök uppdrag..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        <Pressable
          onPress={() => setSortNearest((prev) => !prev)}
          style={[styles.sortButton, sortNearest && styles.sortButtonActive]}
        >
          <View style={styles.sortButtonInner}>
            <Image source={require("@/assets/images/location-icon-transparent.png")} style={[styles.locationIconSmall, { tintColor: sortNearest ? "#fff" : "#16A34A" }]} resizeMode="contain" />
            <Text style={[styles.sortButtonText, sortNearest && styles.sortButtonTextActive]}>
              Närmast
            </Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={(() => {
          let filtered = userId ? tasks.filter((t) => t.createdById !== userId) : tasks;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered
              .filter((t) =>
                (t.title?.toLowerCase().includes(q)) ||
                (t.description?.toLowerCase().includes(q)) ||
                (t.area?.toLowerCase().includes(q))
              )
              .sort((a, b) => {
                const aTitle = a.title?.toLowerCase().includes(q) ? 0 : 1;
                const bTitle = b.title?.toLowerCase().includes(q) ? 0 : 1;
                if (aTitle !== bTitle) return aTitle - bTitle;
                const aDesc = a.description?.toLowerCase().includes(q) ? 0 : 1;
                const bDesc = b.description?.toLowerCase().includes(q) ? 0 : 1;
                return aDesc - bDesc;
              });
          }
          if (sortNearest && userLocation) {
            filtered = [...filtered].sort((a, b) => {
              const coordsA = a.area ? AREA_COORDS[a.area] : null;
              const coordsB = b.area ? AREA_COORDS[b.area] : null;
              const distA = coordsA ? getDistanceKm(userLocation.lat, userLocation.lng, coordsA.lat, coordsA.lng) : 999;
              const distB = coordsB ? getDistanceKm(userLocation.lat, userLocation.lng, coordsB.lat, coordsB.lng) : 999;
              return distA - distB;
            });
          }
          return filtered;
        })()}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderTask}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111" />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color="#16A34A" /> : null}
        ListEmptyComponent={
          <EmptyState icon="📋" title="Inga uppdrag just nu" subtitle="Dra nedåt för att uppdatera" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sortButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sortButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  locationIcon: {
    width: 14,
    height: 14,
  },
  locationIconSmall: {
    width: 18,
    height: 18,
  },
  sortButtonActive: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  wordmark: {
    width: 650,
    height: 160,
    alignSelf: "flex-start",
    marginLeft: -280,
    marginVertical: -52,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    marginRight: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardDistance: {
    fontSize: 12,
    color: "#888",
    marginTop: -7,
  },
  areaBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    marginLeft: -8,
  },
  areaBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#16A34A",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
  },
  cardButton: {
    marginTop: 14,
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  cardButtonHovered: {
    backgroundColor: "#15913F",
    shadowOpacity: 0.55,
    transform: [{ scale: 1.015 }],
  },
  cardButtonPressed: {
    opacity: 0.85,
    shadowOpacity: 0.25,
  },
  cardButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
