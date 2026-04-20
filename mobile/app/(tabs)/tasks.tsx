import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { taskApi, offerApi } from "@/src/api/client";
import { useUser } from "@/src/context/UserContext";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";
import { TASK_CATEGORIES, TASK_URGENCIES } from "@/src/helpers/categories";
import { TaskCard } from "@/src/components/TaskCard";
import { DiscoverListSkeleton } from "@/src/components/Skeleton";
import { createModalStyles } from "@/src/styles/modal";
import { createFormStyles } from "@/src/styles/form";
import { useTheme } from "@/src/context/ThemeContext";
import { createTasksStyles } from "@/src/styles/screens/tasks";
import { pickTaskImages, uploadImage } from "@/src/helpers/images";
import { timeAgo } from "@/src/helpers/time";
import type { MyOfferResponse } from "@/src/api/generated/models/MyOfferResponse";

const STATUS_ORDER: Record<string, number> = {
  OPEN: 0,
  ASSIGNED: 1,
  CANCELLED: 2,
  COMPLETED: 3,
};

export default function TasksScreen() {
  const router = useRouter();
  const { loggedIn } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createTasksStyles(colors), [colors]);
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
  const formStyles = useMemo(() => createFormStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<"tasks" | "offers">("tasks");
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [myOffers, setMyOffers] = useState<MyOfferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newUrgency, setNewUrgency] = useState("FLEXIBLE");
  const [newArea, setNewArea] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);


  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const canCreate = newTitle.trim().length > 0 && newDescription.trim().length > 0 && newCategory.length > 0 && newArea.length > 0 && !creating;

  function resetCreateForm() {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("");
    setNewUrgency("FLEXIBLE");
    setNewArea("");
    setNewStreet("");
    setNewPrice("");
    setAreaSearch("");
    setImageUris([]);
  }

  async function handlePickImages() {
    const uris = await pickTaskImages();
    if (uris.length > 0) {
      setImageUris((prev) => [...prev, ...uris].slice(0, 5));
    }
  }

  async function handleCreateTask() {
    if (!canCreate) return;
    setCreating(true);
    try {
      let uploadedUrls: string[] = [];
      if (imageUris.length > 0) {
        const results = await Promise.all(imageUris.map(uploadImage));
        uploadedUrls = results.filter((u): u is string => u !== null);
      }
      await taskApi.createTask({
        createTaskRequest: {
          title: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
          urgency: newUrgency,
          city: "Stockholm",
          area: newArea,
          street: newStreet.trim() || undefined,
          offeredPrice: newPrice ? Number(newPrice) : undefined,
          imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
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

  const fetchMyOffers = useCallback(async () => {
    try {
      const res = await offerApi.getMyOffers();
      setMyOffers(res ?? []);
    } catch (e) {
      console.log("Failed to load my offers:", e);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchTasks(), fetchMyOffers()]);
  }, [fetchTasks, fetchMyOffers]);

  useEffect(() => {
    if (loggedIn) {
      fetchAll().finally(() => setLoading(false));
    } else if (loggedIn === false) {
      setLoading(false);
    }
  }, [loggedIn, fetchAll]);

  useFocusEffect(
    useCallback(() => {
      if (loggedIn) fetchAll();
    }, [loggedIn, fetchAll])
  );

  async function onRefresh() {
    setRefreshing(true);
    if (loggedIn) await fetchAll();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <DiscoverListSkeleton />
      </SafeAreaView>
    );
  }

  if (!loggedIn) {
    return (
      <View style={styles.safe}>
        <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
          <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
            <Text style={styles.title}>Uppdrag</Text>
          </LinearGradient>
        </SafeAreaView>
        <View style={[styles.centered, { flex: 1, paddingBottom: 80 }]}>
          <Image
            source={require("@/assets/images/activity-icon.png")}
            style={styles.loginIcon}
            resizeMode="contain"
          />
          <Text style={styles.loginTitle}>Dina uppdrag</Text>
          <Text style={styles.loginSubtitle}>Skapa och hantera dina småjobb</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile?returnTo=tasks")}
            style={({ pressed, hovered }: any) => [
              styles.loginButton,
              hovered && styles.loginButtonHovered,
              pressed && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>Logga in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderTask({ item }: { item: TaskResponse }) {
    return (
      <TaskCard
        task={item}
        showStatus
        showOffers
        showCategory={false}
        navigateParams="&from=activity"
      />
    );
  }

  const activeTasks = tasks.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED");
  const finishedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED");

  const taskSections = [
    ...(activeTasks.length > 0 ? [{ title: "Aktiva", data: activeTasks }] : []),
    ...(finishedTasks.length > 0 ? [{ title: "Avslutade", data: finishedTasks }] : []),
  ];

  const OFFER_STATUS_ORDER: Record<string, number> = {
    ACCEPTED: 0,
    MARKED_DONE: 1,
    PENDING: 2,
    COMPLETED: 3,
    DECLINED: 4,
    CANCELLED: 5,
  };

  const OFFER_STATUS_LABELS: Record<string, string> = {
    PENDING: "Väntar",
    ACCEPTED: "Accepterat",
    MARKED_DONE: "Markerat klart",
    COMPLETED: "Slutfört",
    DECLINED: "Avböjt",
    CANCELLED: "Avbrutet",
  };

  const OFFER_STATUS_COLORS: Record<string, string> = {
    PENDING: "#F59E0B",
    ACCEPTED: "#22C55E",
    MARKED_DONE: "#3B82F6",
    COMPLETED: "#6366F1",
    DECLINED: "#9CA3AF",
    CANCELLED: "#EF4444",
  };

  const sortedOffers = [...myOffers].sort((a, b) =>
    (OFFER_STATUS_ORDER[a.status ?? ""] ?? 99) - (OFFER_STATUS_ORDER[b.status ?? ""] ?? 99)
  );

  const activeOffers = sortedOffers.filter((o) => ["PENDING", "ACCEPTED", "MARKED_DONE"].includes(o.status ?? ""));
  const pastOffers = sortedOffers.filter((o) => ["COMPLETED", "DECLINED", "CANCELLED"].includes(o.status ?? ""));

  const offerSections = [
    ...(activeOffers.length > 0 ? [{ title: "Aktiva", data: activeOffers }] : []),
    ...(pastOffers.length > 0 ? [{ title: "Avslutade", data: pastOffers }] : []),
  ];

  function renderOffer({ item }: { item: MyOfferResponse }) {
    const task = item.task;
    if (!task) return null;
    const statusColor = OFFER_STATUS_COLORS[item.status ?? ""] ?? "#888";
    const statusLabel = OFFER_STATUS_LABELS[item.status ?? ""] ?? item.status;

    const isDeclined = item.status === "DECLINED" || item.status === "CANCELLED";

    return (
      <Pressable
        onPress={isDeclined ? undefined : () => router.push(`/task-detail?id=${task.id}` as any)}
        style={({ pressed }) => [styles.offerCard, pressed && !isDeclined && { opacity: 0.7 }, isDeclined && { opacity: 0.5 }]}
      >
        <View style={styles.offerCardHeader}>
          <Text style={styles.offerTaskTitle} numberOfLines={1}>{task.title}</Text>
          {item.proposedPrice != null && (
            <Text style={styles.offerPrice}>{item.proposedPrice} kr</Text>
          )}
        </View>

        <View style={styles.offerCardMeta}>
          <View style={[styles.offerStatusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.offerStatusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.offerCardFooter}>
          {item.createdAt && (
            <Text style={styles.offerDate}>{timeAgo(item.createdAt)}</Text>
          )}
          {!isDeclined && (
            <Text style={styles.offerDetailLink}>Visa detaljer →</Text>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
        <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
          <Text style={styles.title}>Uppdrag</Text>
        </LinearGradient>
      </SafeAreaView>

      <View style={styles.segmentRow}>
        <Pressable
          onPress={() => setActiveTab("tasks")}
          style={[styles.segmentButton, activeTab === "tasks" && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentText, activeTab === "tasks" && styles.segmentTextActive]}>
            Mina uppdrag
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("offers")}
          style={[styles.segmentButton, activeTab === "offers" && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentText, activeTab === "offers" && styles.segmentTextActive]}>
            Mina erbjudanden
          </Text>
        </Pressable>
      </View>

      {activeTab === "tasks" ? (
        tasks.length === 0 ? (
          <View style={[styles.centered, { flex: 1, paddingBottom: 140 }]}>
            <Image
              source={require("@/assets/images/activity-icon.png")}
              style={styles.loginIcon}
              resizeMode="contain"
            />
            <Text style={styles.loginTitle}>Inga uppdrag</Text>
            <Text style={styles.loginSubtitle}>Tryck + för att skapa ditt första uppdrag</Text>
          </View>
        ) : (
          <SectionList
            sections={taskSections}
            keyExtractor={(item) => item.id ?? Math.random().toString()}
            renderItem={({ item }) => renderTask({ item })}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            stickySectionHeadersEnabled={false}
          />
        )
      ) : (
        myOffers.length === 0 ? (
          <View style={[styles.centered, { flex: 1, paddingBottom: 140 }]}>
            <Image
              source={require("@/assets/images/activity-icon.png")}
              style={styles.loginIcon}
              resizeMode="contain"
            />
            <Text style={styles.loginTitle}>Inga erbjudanden</Text>
            <Text style={styles.loginSubtitle}>Hjälp till med uppdrag på Upptäck-sidan</Text>
          </View>
        ) : (
          <SectionList
            sections={offerSections}
            keyExtractor={(item) => item.id ?? Math.random().toString()}
            renderItem={renderOffer}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            stickySectionHeadersEnabled={false}
          />
        )
      )}

      {loggedIn && activeTab === "tasks" && (
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
                  placeholderTextColor={colors.textMuted}
                  style={formStyles.input}
                />

                <Text style={formStyles.label}>Beskrivning <Text style={formStyles.required}>*</Text></Text>
                <TextInput
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Beskriv uppdraget..."
                  placeholderTextColor={colors.textMuted}
                  style={[formStyles.input, formStyles.textArea]}
                  multiline
                />

                <Text style={formStyles.label}>Kategori <Text style={formStyles.required}>*</Text></Text>
                <View style={styles.categoryGrid}>
                  {TASK_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.key}
                      onPress={() => setNewCategory(cat.key)}
                      style={[
                        styles.categoryChip,
                        newCategory === cat.key && styles.categoryChipActive,
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={[
                        styles.categoryChipText,
                        newCategory === cat.key && styles.categoryChipTextActive,
                      ]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={formStyles.label}>När behöver du hjälp?</Text>
                <View style={styles.categoryGrid}>
                  {TASK_URGENCIES.map((u) => (
                    <Pressable
                      key={u.key}
                      onPress={() => setNewUrgency(u.key)}
                      style={[
                        styles.categoryChip,
                        newUrgency === u.key && styles.categoryChipActive,
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{u.emoji}</Text>
                      <Text style={[
                        styles.categoryChipText,
                        newUrgency === u.key && styles.categoryChipTextActive,
                      ]}>
                        {u.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={formStyles.label}>Område <Text style={formStyles.required}>*</Text></Text>
                {areaPickerOpen ? (
                  <View>
                    <TextInput
                      value={areaSearch}
                      onChangeText={setAreaSearch}
                      placeholder="Sök område..."
                      placeholderTextColor={colors.textMuted}
                      style={formStyles.input}
                      autoFocus
                    />
                    <ScrollView style={styles.areaList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {filteredAreas.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() => {
                            setNewArea(item);
                            setAreaPickerOpen(false);
                            setAreaSearch("");
                          }}
                          style={({ pressed }) => [styles.areaItem, pressed && { backgroundColor: "#f5f5f5" }]}
                        >
                          <Text style={[styles.areaItemText, item === newArea && { color: "#16A34A", fontWeight: "600" }]}>{item}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
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
                  placeholderTextColor={colors.textMuted}
                  style={formStyles.input}
                />

                <Text style={formStyles.label}>Pris <Text style={formStyles.optional}>(valfritt)</Text></Text>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Ersättning i kr"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={formStyles.input}
                />

                <Text style={formStyles.label}>Bilder <Text style={formStyles.optional}>(valfritt, max 5)</Text></Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {imageUris.map((uri, i) => (
                      <View key={i} style={{ position: "relative" }}>
                        <Image source={{ uri }} style={styles.imageThumb} />
                        <Pressable
                          onPress={() => setImageUris((prev) => prev.filter((_, idx) => idx !== i))}
                          style={styles.imageRemove}
                        >
                          <Text style={styles.imageRemoveText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                    {imageUris.length < 5 && (
                      <Pressable onPress={handlePickImages} style={styles.imageAdd}>
                        <Text style={styles.imageAddText}>+</Text>
                        <Text style={styles.imageAddLabel}>Lägg till</Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>

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

