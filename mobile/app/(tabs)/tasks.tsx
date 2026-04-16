import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { taskApi } from "@/src/api/client";
import { useUser } from "@/src/context/UserContext";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";
import { EmptyState } from "@/src/components/EmptyState";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";
import { TASK_CATEGORIES } from "@/src/helpers/categories";
import { TaskCard } from "@/src/components/TaskCard";
import { DiscoverListSkeleton } from "@/src/components/Skeleton";
import { createModalStyles } from "@/src/styles/modal";
import { createFormStyles } from "@/src/styles/form";
import { useTheme } from "@/src/context/ThemeContext";
import { createTasksStyles } from "@/src/styles/screens/tasks";

const STATUS_ORDER: Record<string, number> = {
  ASSIGNED: 0,
  OPEN: 1,
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
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [creating, setCreating] = useState(false);


  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const canCreate = newTitle.trim().length > 0 && newDescription.trim().length > 0 && newCategory.length > 0 && newArea.length > 0 && !creating;

  function resetCreateForm() {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("");
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
          category: newCategory,
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

  useEffect(() => {
    if (loggedIn) {
      fetchTasks().finally(() => setLoading(false));
    } else if (loggedIn === false) {
      setLoading(false);
    }
  }, [loggedIn, fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      if (loggedIn) fetchTasks();
    }, [loggedIn, fetchTasks])
  );

  async function onRefresh() {
    setRefreshing(true);
    if (loggedIn) await fetchTasks();
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

  const sections = [
    ...(activeTasks.length > 0 ? [{ title: "Aktiva uppdrag", data: activeTasks }] : []),
    ...(finishedTasks.length > 0 ? [{ title: "Avslutade uppdrag", data: finishedTasks }] : []),
  ];

  return (
    <View style={styles.safe}>
      <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
        <LinearGradient colors={colors.headerGradient} style={styles.headerRow}>
          <Text style={styles.title}>Uppdrag</Text>
        </LinearGradient>
      </SafeAreaView>

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
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

