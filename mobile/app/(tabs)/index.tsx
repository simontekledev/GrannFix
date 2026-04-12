import { taskQueryApi, userApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import { EmptyState } from "@/src/components/EmptyState";
import { formatDistance, getDistanceKm, AREA_COORDS } from "@/src/helpers/distance";
import { timeAgo } from "@/src/helpers/time";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";


export default function UpptäckScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNearest, setSortNearest] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

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
      const cachedId = await AsyncStorage.getItem("user_id");
      if (cachedId) {
        setUserId(cachedId);
      } else {
        try {
          const me = await userApi.getMe();
          if (me.id) {
            setUserId(me.id);
            await AsyncStorage.setItem("user_id", me.id);
          }
        } catch (_) {}
      }
    } else {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("access_token").then((token) => {
      setLastToken(token);
    });
    Promise.all([fetchTasks(), checkAuth()]).finally(() => setLoading(false));
  }, [fetchTasks, checkAuth]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("access_token").then((token) => {
        if (token !== lastToken) {
          setLastToken(token);
          checkAuth();
          fetchTasks();
        }
      });
    }, [lastToken, checkAuth, fetchTasks])
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
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
        onPress={() => router.push(`/task-detail?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title ?? "Uppdrag"}
          </Text>
          {item.offeredPrice != null && (
            <View style={styles.priceBadge}>
              <Text style={styles.cardPrice}>{item.offeredPrice} kr</Text>
            </View>
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

        <View style={styles.cardFooter}>
          {item.createdAt && (
            <Text style={styles.cardDate}>{timeAgo(item.createdAt)}</Text>
          )}
          <Text style={styles.cardDetailLink}>Visa detaljer →</Text>
        </View>

        <Pressable
          onPress={() => loggedIn
            ? router.push(`/task-detail?id=${item.id}&offer=true`)
            : router.push("/(tabs)/profile?returnTo=index")
          }
          style={({ pressed, hovered }: any) => [
            styles.cardButton,
            hovered && styles.cardButtonHovered,
            pressed && styles.cardButtonPressed,
          ]}
        >
          <Text style={styles.cardButtonText}>
            {loggedIn ? "Hjälp till" : "Logga in för att hjälpa till"}
          </Text>
        </Pressable>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
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
            <Text style={styles.listTitle}>Tillgängliga uppdrag</Text>
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
          <View style={{ paddingTop: 140 }}>
            <EmptyState iconImage={require("@/assets/images/empty-inbox-icon.png")} title="Inga uppdrag just nu" subtitle="Dra nedåt för att uppdatera" />
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeTop: {
      backgroundColor: colors.headerGradient[0],
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
      paddingBottom: 12,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary,
      outlineStyle: "none",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    } as any,
    sortButton: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    sortButtonInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    sortButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
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
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    sortButtonTextActive: {
      color: "#fff",
    },
    listTitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    headerSearchButton: {
      position: "absolute",
      right: 16,
      padding: 6,
    },
    headerSearchIcon: {
      width: 26,
      height: 26,
      tintColor: colors.textPrimary,
    },
    searchOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      zIndex: 10,
    },
    searchOverlayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    searchOverlayInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary,
      outlineStyle: "none",
    } as any,
    searchCancel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.accent,
    },
    searchEmptyText: {
      textAlign: "center",
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 40,
    },
    headerLogo: {
      width: 800,
      height: 195,
      marginVertical: -78,
    },
    headerLogoRow: {
      alignItems: "center",
    },
    wordmark: {
      width: 650,
      height: 160,
      marginVertical: -52,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 2,
    },
    list: {
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    emptyList: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
      shadowColor: colors.shadow,
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
      color: colors.textPrimary,
      flex: 1,
      marginRight: 12,
    },
    cardHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardChevron: {
      fontSize: 20,
      color: colors.textMuted,
    },
    priceBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    cardPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.accent,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    cardDistance: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -7,
    },
    areaBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.accentMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 8,
      marginLeft: -8,
    },
    areaBadgeText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
    },
    cardDate: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardDetailLink: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
    },
    cardButton: {
      marginTop: 14,
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
    cardButtonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
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
}
