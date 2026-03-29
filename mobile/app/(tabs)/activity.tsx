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
import { EmptyState } from "@/src/components/EmptyState";
import { FilterChips } from "@/src/components/FilterChips";
import { timeAgo } from "@/src/helpers/time";

const STATUS_ORDER: Record<string, number> = {
  ASSIGNED: 0,
  OPEN: 1,
  CANCELLED: 2,
  COMPLETED: 3,
};

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
  const [filter, setFilter] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    setLoggedIn(!!token);
    return !!token;
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskApi.getMyTasks();
      const sorted = [...res].sort((a, b) => {
        const statusDiff = (STATUS_ORDER[a.status ?? "OPEN"] ?? 99) - (STATUS_ORDER[b.status ?? "OPEN"] ?? 99);
        if (statusDiff !== 0) return statusDiff;
        return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      });
      setTasks(sorted);
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
          <EmptyState icon="💬" title="Ingen aktivitet" subtitle="Logga in för att se dina uppdrag och chattar" />
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed, hovered }: any) => [
              styles.loginButton,
              hovered && styles.loginButtonHovered,
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
    const statusColor = STATUS_COLORS[status] ?? "#888";
    return (
      <View style={[styles.card, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title ?? "Uppdrag"}
          </Text>
          {item.offeredPrice != null && (
            <Text style={styles.cardPrice}>{item.offeredPrice} kr</Text>
          )}
        </View>

        <View style={styles.cardMeta}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {item.createdAt && (
          <Text style={styles.cardDate}>
            {timeAgo(item.createdAt)}
          </Text>
        )}
      </View>
    );
  }

  const FILTERS = [
    { key: null, label: "Alla" },
    { key: "OPEN", label: "Öppna" },
    { key: "ASSIGNED", label: "Tilldelade" },
    { key: "CANCELLED", label: "Avbrutna" },
    { key: "COMPLETED", label: "Klara" },
  ];

  const filteredTasks = filter ? tasks.filter((t) => t.status === filter) : tasks;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Aktivitet</Text>
        <Text style={styles.subtitle}>Dina uppdrag</Text>
      </View>

      <FilterChips filters={FILTERS} active={filter} onChange={setFilter} />

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title={filter ? `Inga ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} uppdrag` : "Inga uppdrag"}
          subtitle={filter ? "Prova ett annat filter" : "Du har inga uppdrag just nu.\nDra nedåt för att uppdatera."}
        />
      ) : (
        <FlatList
          data={filteredTasks}
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
  areaBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
  },
  cardDate: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  loginButtonHovered: {
    backgroundColor: "#15913F",
    transform: [{ scale: 1.015 }],
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
