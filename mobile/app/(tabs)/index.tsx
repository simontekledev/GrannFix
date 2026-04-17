import { taskQueryApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TaskCard } from "@/src/components/TaskCard";
import { DiscoverListSkeleton } from "@/src/components/Skeleton";
import { formatDistance, getDistanceKm, AREA_COORDS } from "@/src/helpers/distance";
import { useUser } from "@/src/context/UserContext";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import { createDiscoverStyles } from "@/src/styles/screens/discover";
import { TASK_CATEGORIES } from "@/src/helpers/categories";


export default function UpptäckScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => createDiscoverStyles(colors), [colors]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const { user, loggedIn } = useUser();
  const userId = user?.id ?? null;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortNearest, setSortNearest] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem("onboarding_complete").then((done) => {
      if (!done) router.replace("/onboarding");
    });
  }, []);

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
        category: selectedCategory ?? undefined,
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
  }, [selectedCategory]);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  async function onRefresh() {
    setRefreshing(true);
    await fetchTasks();
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
      <TaskCard
        task={item}
        showArea
        distanceText={distanceText}
        actionButton={{
          label: loggedIn ? "Hjälp till" : "Logga in för att hjälpa till",
          onPress: () => loggedIn
            ? router.push(`/task-detail?id=${item.id}&offer=true` as any)
            : router.push("/(tabs)/profile?returnTo=index"),
        }}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <DiscoverListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
        <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
          <Image
            source={
              mode === "dark"
                ? require("@/assets/images/grannfix-wordmark-transparent-dark.png")
                : require("@/assets/images/grannfix-wordmark-transparent.png")
            }
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Pressable
            onPress={() => {
              setSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            style={({ pressed }) => [styles.headerSearchButton, pressed && { opacity: 0.6 }]}
          >
            <Image
              source={require("@/assets/images/search-icon.png")}
              style={styles.headerSearchIcon}
              resizeMode="contain"
            />
          </Pressable>
        </LinearGradient>
      </SafeAreaView>
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
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            <Text style={styles.listTitle}>Tillgängliga småjobb</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TASK_CATEGORIES}
              keyExtractor={(item) => item.key}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
              renderItem={({ item: cat }) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <Pressable
                    onPress={() => setSelectedCategory(isActive ? null : cat.key)}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  >
                    <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>{cat.label}</Text>
                  </Pressable>
                );
              }}
            />
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Sök uppdrag..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setSortNearest((prev) => !prev)}
                style={[styles.sortButton, sortNearest && styles.sortButtonActive]}
              >
                <View style={styles.sortButtonInner}>
                  <Image source={require("@/assets/images/location-icon-transparent.png")} style={[styles.locationIconSmall, { tintColor: sortNearest ? "#fff" : colors.accent }]} resizeMode="contain" />
                  <Text style={[styles.sortButtonText, sortNearest && styles.sortButtonTextActive]}>
                    Närmast
                  </Text>
                </View>
              </Pressable>
            </View>
          </>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} /> : null}
        ListEmptyComponent={
          <View style={[styles.centered, { flex: 1, paddingBottom: 120 }]}>
            <Image
              source={require("@/assets/images/empty-inbox-icon.png")}
              style={{ width: 130, height: 130, tintColor: colors.accent, marginBottom: -15 }}
            />
            <Text style={styles.loginTitle}>Inga uppdrag just nu</Text>
            <Text style={styles.loginSubtitle}>
              Dra nedåt för att uppdatera
            </Text>
          </View>
        }
      />

      {searchOpen && (
        <View style={styles.searchOverlay}>
          <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }} edges={["top"]}>
            <View style={styles.searchOverlayHeader}>
              <TextInput
                ref={searchInputRef}
                style={styles.searchOverlayInput}
                placeholder="Sök uppdrag..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              <Pressable
                onPress={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.searchCancel}>Avbryt</Text>
              </Pressable>
            </View>
            <FlatList
              data={searchQuery.trim()
                ? (userId ? tasks.filter((t) => t.createdById !== userId) : tasks)
                    .filter((t) => {
                      const q = searchQuery.toLowerCase();
                      return (
                        (t.title?.toLowerCase().includes(q)) ||
                        (t.description?.toLowerCase().includes(q)) ||
                        (t.area?.toLowerCase().includes(q))
                      );
                    })
                    .sort((a, b) => {
                      const q = searchQuery.toLowerCase();
                      const aTitle = a.title?.toLowerCase().includes(q) ? 0 : 1;
                      const bTitle = b.title?.toLowerCase().includes(q) ? 0 : 1;
                      if (aTitle !== bTitle) return aTitle - bTitle;
                      const aDesc = a.description?.toLowerCase().includes(q) ? 0 : 1;
                      const bDesc = b.description?.toLowerCase().includes(q) ? 0 : 1;
                      return aDesc - bDesc;
                    })
                : []}
              keyExtractor={(item) => item.id ?? Math.random().toString()}
              renderItem={renderTask}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                searchQuery.trim() ? (
                  <Text style={styles.searchEmptyText}>Inga träffar</Text>
                ) : null
              }
            />
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

