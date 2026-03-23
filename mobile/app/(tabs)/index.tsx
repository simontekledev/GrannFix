import { taskQueryApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpptackScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

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

        {item.area && (
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText}>{item.area}</Text>
          </View>
        )}

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {!loggedIn && (
          <Pressable
            onPress={() => router.push("/(tabs)/profil")}
            style={({ pressed }) => [
              styles.cardButton,
              pressed && styles.cardButtonPressed,
            ]}
          >
            <Text style={styles.cardButtonText}>Logga in för att hjälpa till</Text>
          </Pressable>
        )}
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
        <Text style={styles.title}>Upptack</Text>
        <Text style={styles.subtitle}>Tillgangliga uppdrag</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Inga uppdrag just nu</Text>
          <Text style={styles.emptySubtitle}>
            Dra nedat for att uppdatera
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={renderTask}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
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
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
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
  areaBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    paddingHorizontal: 1,
    paddingVertical: 4,
    marginBottom: 8,
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
  cardButton: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cardButtonPressed: {
    opacity: 0.8,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
