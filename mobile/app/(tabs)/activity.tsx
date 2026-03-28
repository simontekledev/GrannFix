import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { taskApi } from "@/src/api/client";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Öppen",
  ASSIGNED: "Tilldelad",
  COMPLETED: "Klar",
  CANCELLED: "Avbruten",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#16A34A",
  ASSIGNED: "#2563eb",
  COMPLETED: "#6b7280",
  CANCELLED: "#dc2626",
};

export default function AktivitetScreen() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    setLoggedIn(!!token);
    return !!token;
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskApi.getMyTasks();
      setTasks(res);
    } catch (e) {
      console.log("Failed to load my tasks:", e);
    }
  }, []);

  // Load data once on mount
  useEffect(() => {
    checkAuth().then((isLoggedIn) => {
      if (isLoggedIn) {
        fetchTasks().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [checkAuth, fetchTasks]);

  // Only re-check auth (local) on tab focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("access_token").then((token) => {
        const isLoggedIn = !!token;
        if (isLoggedIn !== loggedIn) {
          checkAuth().then((loggedIn) => {
            if (loggedIn) fetchTasks();
          });
        }
      });
    }, [loggedIn, checkAuth, fetchTasks])
  );

  async function onRefresh() {
    setRefreshing(true);
    const isLoggedIn = await checkAuth();
    if (isLoggedIn) await fetchTasks();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Ingen aktivitet</Text>
          <Text style={styles.emptySubtitle}>
            Logga in för att se dina uppdrag och chattar
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>Logga in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function renderTask({ item }: { item: TaskResponse }) {
    const status = item.status ?? "OPEN";
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
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[status] ?? "#888") + "18" }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[status] ?? "#888" }]}>
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
          {item.area && <Text style={styles.cardArea}>{item.area}</Text>}
        </View>

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Aktivitet</Text>
        <Text style={styles.subtitle}>Dina uppdrag</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Inga uppdrag</Text>
          <Text style={styles.emptySubtitle}>
            Du har inga uppdrag just nu
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={renderTask}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: -2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardArea: {
    fontSize: 13,
    color: "#666",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
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
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  loginButtonPressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
