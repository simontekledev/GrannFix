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
  SectionList,
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
import { timeAgo } from "@/src/helpers/time";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";
import { modalStyles } from "@/src/styles/modal";
import { formStyles } from "@/src/styles/form";

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
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"tasks" | "messages">("tasks");

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
      if (lastToken === null) return;
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
          {item.pendingOffersCount != null && item.pendingOffersCount > 0 && (
            <View style={styles.offerBadge}>
              <View style={styles.offerDot} />
              <Text style={styles.offerBadgeText}>{item.pendingOffersCount} nya</Text>
            </View>
          )}
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
          <View style={styles.cardFooterRight}>
            <Text style={styles.cardDetailLink}>Visa detaljer →</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const activeTasks = tasks.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED");
  const finishedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED");

  const sections = [
    ...(activeTasks.length > 0 ? [{ title: "Aktiva", data: activeTasks }] : []),
    ...(finishedTasks.length > 0 ? [{ title: "Avslutade", data: finishedTasks }] : []),
  ];

  return (
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: "#e8f5e9" }} edges={["top"]}>
        <LinearGradient colors={["#e8f5e9", "#f5faf2"]} style={styles.headerRow}>
          <Text style={styles.title}>Aktivitet</Text>
        </LinearGradient>
      </SafeAreaView>

      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => setActiveView("tasks")}
          style={[styles.toggleButton, activeView === "tasks" && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, activeView === "tasks" && styles.toggleTextActive]}>Uppdrag</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveView("messages")}
          style={[styles.toggleButton, activeView === "messages" && styles.toggleButtonActive]}
        >
          <Image
            source={require("@/assets/images/chat-icon.png")}
            style={[styles.toggleIcon, { tintColor: activeView === "messages" ? "#fff" : "#555" }]}
            resizeMode="contain"
          />
          <Text style={[styles.toggleText, activeView === "messages" && styles.toggleTextActive]}>Meddelanden</Text>
        </Pressable>
      </View>

      {activeView === "tasks" && (
        <>
          {tasks.length === 0 ? (
            <EmptyState
              iconImage={require("@/assets/images/empty-inbox-icon.png")}
              title="Inga uppdrag"
              subtitle="Du har inga uppdrag just nu."
            />
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id ?? Math.random().toString()}
              renderItem={({ item }) => renderTask({ item })}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />
              }
              stickySectionHeadersEnabled={false}
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
        </>
      )}

      {activeView === "messages" && (
        <View style={styles.centered}>
          <EmptyState
            iconImage={require("@/assets/images/chat-icon.png")}
            title="Inga meddelanden"
            subtitle="Här visas dina chattar när du har aktiva uppdrag"
          />
        </View>
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
          <View style={modalStyles.overlay}>
            <Pressable
              style={modalStyles.overlayTouchable}
              onPress={() => { setShowCreateModal(false); resetCreateForm(); }}
            />
            <View style={modalStyles.content}>
              <View style={modalStyles.handle} />
              <Text style={modalStyles.title}>Nytt uppdrag</Text>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={formStyles.label}>Titel <Text style={formStyles.required}>*</Text></Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Vad behöver du hjälp med?"
                  placeholderTextColor="#a0a0a0"
                  style={formStyles.input}
                />

                <Text style={formStyles.label}>Beskrivning <Text style={formStyles.required}>*</Text></Text>
                <TextInput
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Beskriv uppdraget..."
                  placeholderTextColor="#a0a0a0"
                  style={[formStyles.input, formStyles.textArea]}
                  multiline
                />

                <Text style={formStyles.label}>Område <Text style={formStyles.required}>*</Text></Text>
                {areaPickerOpen ? (
                  <View>
                    <TextInput
                      value={areaSearch}
                      onChangeText={setAreaSearch}
                      placeholder="Sök område..."
                      placeholderTextColor="#a0a0a0"
                      style={formStyles.input}
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
                    style={formStyles.input}
                  >
                    <Text style={newArea ? styles.areaSelectedText : styles.areaPlaceholderText}>
                      {newArea || "Välj område"}
                    </Text>
                  </Pressable>
                )}

                <Text style={formStyles.label}>Adress <Text style={formStyles.optional}>(valfritt)</Text></Text>
                <TextInput
                  value={newStreet}
                  onChangeText={setNewStreet}
                  placeholder="Gatuadress"
                  placeholderTextColor="#a0a0a0"
                  style={formStyles.input}
                />

                <Text style={formStyles.label}>Pris <Text style={formStyles.optional}>(valfritt)</Text></Text>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Ersättning i kr"
                  placeholderTextColor="#a0a0a0"
                  keyboardType="number-pad"
                  style={formStyles.input}
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
    backgroundColor: "#f5faf2",
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
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
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
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  offerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  offerBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
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
  cardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chatButtonIcon: {
    width: 14,
    height: 14,
    tintColor: "#16A34A",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
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
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 12,
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  toggleButtonActive: {
    borderBottomColor: "#16A34A",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#999",
  },
  toggleTextActive: {
    color: "#111",
    fontWeight: "600",
  },
  toggleIcon: {
    width: 16,
    height: 16,
  },
  areaList: {
    maxHeight: 150,
    backgroundColor: "#f5faf2",
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
