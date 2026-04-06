import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

const STATUS_COLORS = {
  OPEN: "#22C55E",       
  ASSIGNED: "#F59E0B",  
  COMPLETED: "#6366F1", 
  CANCELLED: "#EF4444",  
};

export default function AktivitetScreen() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const STOCKHOLM_AREAS = [
    "Södermalm", "Östermalm", "Norrmalm", "Kungsholmen", "Vasastan", "Gamla Stan",
    "Bromma", "Vällingby", "Hässelby", "Spånga", "Kista", "Rinkeby", "Tensta",
    "Hägersten", "Liljeholmen", "Aspudden", "Midsommarkransen",
    "Älvsjö", "Enskede", "Årsta", "Farsta", "Skarpnäck", "Skärholmen", "Annat",
  ];

  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const canCreate = newTitle.trim().length > 0 && newDescription.trim().length > 0 && newArea.length > 0 && !creating;

  function resetCreateForm() {
    setNewTitle("");
    setNewDescription("");
    setNewArea("");
    setNewStreet("");
    setNewPrice("");
    setAreaSearch("");
  }

  async function handleCreateTask() {
    if (!canCreate) return;
    setCreating(true);
    try {
      await taskApi.createTask({
        createTaskRequest: {
          title: newTitle.trim(),
          description: newDescription.trim(),
          city: "Stockholm",
          area: newArea,
          street: newStreet.trim() || undefined,
          offeredPrice: newPrice ? Number(newPrice) : undefined,
        },
      });
      resetCreateForm();
      setShowCreateModal(false);
      fetchTasks();
    } catch (e: any) {
      console.log("Create task error:", e);
      const msg = "Kunde inte skapa uppdraget. Försök igen.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setCreating(false);
    }
  }

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
    AsyncStorage.getItem("access_token").then((token) => {
      setLastToken(token);
    });
    checkAuth().then((isLoggedIn) => {
      if (isLoggedIn) {
        fetchTasks().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [checkAuth, fetchTasks]);

  // Re-check auth and refetch on tab focus if token changed
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("access_token").then((token) => {
        if (token !== lastToken) {
          setLastToken(token);
          checkAuth().then((nowLoggedIn) => {
            if (nowLoggedIn) fetchTasks();
          });
        }
      });
    }, [lastToken, checkAuth, fetchTasks])
  );

  async function onRefresh() {
    setRefreshing(true);
    const isLoggedIn = await checkAuth();
    if (isLoggedIn) await fetchTasks();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!loggedIn) {
    return (
      <SafeAreaView style={[styles.safe, styles.centeredColumn]} edges={["top"]}>
        <View style={styles.loginContent}>
          <Image
            source={require("@/assets/images/keylock-icon.png")}
            style={styles.loginIcon}
            resizeMode="contain"
          />
          <Text style={styles.loginTitle}>Dina uppdrag</Text>
          <Text style={styles.loginSubtitle}>Logga in för att se och hantera dina uppdrag</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile?returnTo=activity")}
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
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
        onPress={() => router.push(`/task-detail?id=${item.id}&from=activity`)}
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

        <View style={styles.cardFooter}>
          {item.createdAt && (
            <Text style={styles.cardDate}>
              {timeAgo(item.createdAt)}
            </Text>
          )}
          <Text style={styles.cardDetailLink}>Visa detaljer →</Text>
        </View>
      </Pressable>
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
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: "#e8f5e9" }} edges={["top"]}>
        <LinearGradient colors={["#e8f5e9", "#F8F9FA"]} style={styles.headerRow}>
          <Text style={styles.title}>Uppdrag</Text>
          <Text style={styles.subtitle}>Dina uppdrag</Text>
        </LinearGradient>
      </SafeAreaView>

      <FilterChips filters={FILTERS} active={filter} onChange={setFilter} />

      {filteredTasks.length === 0 ? (
        <EmptyState
          iconImage={require("@/assets/images/empty-inbox-icon.png")}
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

      {loggedIn && (
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowCreateModal(false); resetCreateForm(); }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalOverlayTouchable}
              onPress={() => { setShowCreateModal(false); resetCreateForm(); }}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Nytt uppdrag</Text>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.modalLabel}>Titel</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Vad behöver du hjälp med?"
                  placeholderTextColor="#a0a0a0"
                  style={styles.modalInput}
                />

                <Text style={styles.modalLabel}>Beskrivning</Text>
                <TextInput
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Beskriv uppdraget..."
                  placeholderTextColor="#a0a0a0"
                  style={[styles.modalInput, styles.modalTextArea]}
                  multiline
                />

                <Text style={styles.modalLabel}>Område</Text>
                {areaPickerOpen ? (
                  <View>
                    <TextInput
                      value={areaSearch}
                      onChangeText={setAreaSearch}
                      placeholder="Sök område..."
                      placeholderTextColor="#a0a0a0"
                      style={styles.modalInput}
                      autoFocus
                    />
                    <FlatList
                      data={filteredAreas}
                      keyExtractor={(item) => item}
                      keyboardShouldPersistTaps="handled"
                      style={styles.areaList}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => {
                            setNewArea(item);
                            setAreaPickerOpen(false);
                            setAreaSearch("");
                          }}
                          style={({ pressed }) => [styles.areaItem, pressed && { backgroundColor: "#f5f5f5" }]}
                        >
                          <Text style={[styles.areaItemText, item === newArea && { color: "#16A34A", fontWeight: "600" }]}>{item}</Text>
                        </Pressable>
                      )}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setAreaPickerOpen(true)}
                    style={styles.modalInput}
                  >
                    <Text style={newArea ? styles.areaSelectedText : styles.areaPlaceholderText}>
                      {newArea || "Välj område"}
                    </Text>
                  </Pressable>
                )}

                <Text style={styles.modalLabel}>Adress (valfritt)</Text>
                <TextInput
                  value={newStreet}
                  onChangeText={setNewStreet}
                  placeholder="Gatuadress"
                  placeholderTextColor="#a0a0a0"
                  style={styles.modalInput}
                />

                <Text style={styles.modalLabel}>Pris (valfritt)</Text>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Ersättning i kr"
                  placeholderTextColor="#a0a0a0"
                  keyboardType="number-pad"
                  style={styles.modalInput}
                />

                <Pressable
                  onPress={handleCreateTask}
                  disabled={!canCreate}
                  style={({ pressed }) => [
                    styles.createButton,
                    !canCreate && styles.createButtonDisabled,
                    pressed && canCreate && { opacity: 0.85 },
                  ]}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Publicera uppdrag</Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111",
    marginLeft: -2,
    letterSpacing: -1.0,
  },
  subtitle: {
    alignSelf: "flex-start",
    fontSize: 15,
    color: "#666",
    marginTop: 14,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 90,
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
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardChevron: {
    fontSize: 20,
    color: "#ccc",
  },
  priceBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardPrice: {
    fontSize: 15,
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  cardDate: {
    fontSize: 12,
    color: "#aaa",
  },
  cardDetailLink: {
    fontSize: 13,
    fontWeight: "500",
    color: "#16A34A",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  centeredColumn: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  loginContent: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loginIcon: {
    width: 70,
    height: 70,
    tintColor: "#999999",
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  loginSubtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  loginButtonHovered: {
    backgroundColor: "#15913F",
    transform: [{ scale: 1.015 }],
  },
  loginButton: {
    marginTop: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 14,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    outlineStyle: "none",
  } as any,
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  areaList: {
    maxHeight: 150,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginTop: 4,
  },
  areaItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  areaItemText: {
    fontSize: 15,
    color: "#111",
  },
  areaSelectedText: {
    fontSize: 15,
    color: "#111",
  },
  areaPlaceholderText: {
    fontSize: 15,
    color: "#a0a0a0",
  },
  createButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.35,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabText: {
    fontSize: 28,
    fontWeight: "400",
    color: "#fff",
    marginTop: -2,
  },
});
