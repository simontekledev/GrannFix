import { taskQueryApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Södermalm": { lat: 59.3150, lng: 18.0700 },
  "Östermalm": { lat: 59.3380, lng: 18.0890 },
  "Norrmalm": { lat: 59.3340, lng: 18.0640 },
  "Kungsholmen": { lat: 59.3320, lng: 18.0300 },
  "Vasastan": { lat: 59.3450, lng: 18.0500 },
  "Gamla Stan": { lat: 59.3258, lng: 18.0716 },
  "Bromma": { lat: 59.3380, lng: 17.9380 },
  "Vällingby": { lat: 59.3630, lng: 17.8710 },
  "Hässelby": { lat: 59.3630, lng: 17.8330 },
  "Spånga": { lat: 59.3830, lng: 17.9020 },
  "Kista": { lat: 59.4030, lng: 17.9440 },
  "Rinkeby": { lat: 59.3880, lng: 17.9280 },
  "Tensta": { lat: 59.3940, lng: 17.9170 },
  "Hägersten": { lat: 59.2960, lng: 18.0080 },
  "Liljeholmen": { lat: 59.3100, lng: 18.0230 },
  "Aspudden": { lat: 59.3050, lng: 18.0100 },
  "Midsommarkransen": { lat: 59.3020, lng: 18.0170 },
  "Älvsjö": { lat: 59.2780, lng: 18.0100 },
  "Enskede": { lat: 59.2830, lng: 18.0700 },
  "Årsta": { lat: 59.2960, lng: 18.0510 },
  "Farsta": { lat: 59.2430, lng: 18.0930 },
  "Skarpnäck": { lat: 59.2660, lng: 18.1320 },
  "Skärholmen": { lat: 59.2760, lng: 17.9530 },
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Just nu";
  if (diffMin < 60) return `${diffMin} min sedan`;
  if (diffH < 24) return diffH === 1 ? "1 timme sedan" : `${diffH} timmar sedan`;
  if (diffD === 1) return "Igår";
  if (diffD < 7) return `${diffD} dagar sedan`;
  if (diffD < 14) return "1 vecka sedan";
  if (diffD < 30) return `${Math.floor(diffD / 7)} veckor sedan`;
  return date.toLocaleDateString("sv-SE");
}

export default function UpptäckScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const fetchTasks = useCallback(async () => {
  try {
    console.log("Fetching tasks...");
    const res = await taskQueryApi.listTasks({
      cursor: undefined,
      limit: 20,
      status: "OPEN",
      city: undefined,
      area: undefined,
    });

    console.log("API response:", res);
    setTasks(res.items ?? []);
  } catch (e: any) {
    console.log("Failed to load tasks:", e);
    console.log("Error message:", e?.message);
    console.log("Error cause:", e?.cause);
  }
}, []);

  const checkAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), checkAuth()]).finally(() => setLoading(false));
  }, [fetchTasks, checkAuth]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([fetchTasks(), checkAuth()]);
    setRefreshing(false);
  }

  function renderTask({ item }: { item: TaskResponse }) {
    let distanceText: string | null = null;
    if (userLocation && item.area) {
      const coords = AREA_COORDS[item.area];
      if (coords) {
        const km = getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        distanceText = km < 1 ? `${Math.round(km * 1000)} m bort` : `${km.toFixed(1)} km bort`;
      }
    }

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
              <Text style={styles.areaBadgeText}>{item.area}</Text>
            </View>
          )}
          {distanceText && (
            <Text style={styles.cardDistance}>{distanceText}</Text>
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
          source={require("@/assets/images/grannfix-wordmark-cut.png")}
          style={styles.wordmark}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Tillgängliga uppdrag</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderTask}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111" />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>
            <Text style={styles.emptyTitle}>Inga uppdrag just nu</Text>
            <Text style={styles.emptySubtitle}>
              Dra nedåt för att uppdatera
            </Text>
          </View>
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
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  wordmark: {
    width: 140,
    height: 34,
    alignSelf: "flex-start",
    marginLeft: -24,
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
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
