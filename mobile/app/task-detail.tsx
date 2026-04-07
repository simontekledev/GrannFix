import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { taskApi, chatApi } from "@/src/api/client";
import { useUser } from "@/src/context/UserContext";
import type { TaskDetailResponse } from "@/src/api/generated/models/TaskDetailResponse";


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

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { user } = useUser();
  const [task, setTask] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [saving, setSaving] = useState(false);

  function openEditModal() {
    if (!task) return;
    setEditTitle(task.title ?? "");
    setEditDescription(task.description ?? "");
    setEditPrice(task.offeredPrice != null ? String(task.offeredPrice) : "");
    setEditStreet(task.street ?? "");
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    if (!id || !editTitle.trim() || !editDescription.trim()) return;
    setSaving(true);
    try {
      await taskApi.updateMyTask({
        id,
        updateTaskRequest: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          offeredPrice: editPrice ? Number(editPrice) : 0,
          street: editStreet.trim() || "",
        },
      });
      const updated = await taskApi.getTask({ id });
      setTask(updated);
      setShowEditModal(false);
    } catch (e: any) {
      console.log("Edit task error:", e);
      const msg = "Kunde inte uppdatera uppdraget";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    setTask(null);
    setLoading(true);
    (async () => {
      try {
        const res = await taskApi.getTask({ id });
        setTask(res);
      } catch (e) {
        console.log("Failed to load task:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleCancel() {
    if (!id) return;
    const doCancel = async () => {
      setCancelling(true);
      try {
        await taskApi.cancelTask({ id });
        router.back();
      } catch (e) {
        console.log("Cancel error:", e);
        const msg = "Kunde inte avbryta uppdraget";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Fel", msg);
      } finally {
        setCancelling(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Vill du avbryta detta uppdrag?")) doCancel();
    } else {
      Alert.alert("Avbryt uppdrag", "Vill du avbryta detta uppdrag?", [
        { text: "Nej", style: "cancel" },
        { text: "Avbryt uppdrag", style: "destructive", onPress: doCancel },
      ]);
    }
  }

  async function handleChat() {
    if (!id) return;
    try {
      const chat = await chatApi.getOrCreateChat({ taskId: id });
      router.push(`/(tabs)/chat?id=${chat.id}` as any);
    } catch (e) {
      console.log("Chat error:", e);
    }
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

  if (!task) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Uppdraget kunde inte hittas</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Tillbaka</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const status = task.status ?? "OPEN";
  const statusColor = STATUS_COLORS[status] ?? "#888";
  const perms = task.permissions;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Tillbaka</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{task.title}</Text>
          {task.offeredPrice != null && (
            <Text style={styles.price}>{task.offeredPrice} kr</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
          {task.createdAt && (
            <Text style={styles.dateText}>
              Publicerad {task.createdAt.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          )}
        </View>

        {task.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>BESKRIVNING</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PLATS</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stad</Text>
            <Text style={styles.detailValue}>{task.city ?? "—"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Område</Text>
            <Text style={styles.detailValue}>{task.area ?? "—"}</Text>
          </View>
          {task.street ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Adress</Text>
                <Text style={styles.detailValue}>{task.street}</Text>
              </View>
            </>
          ) : null}
        </View>

        {task.createdBy && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>SKAPAD AV</Text>
            <View style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(task.createdBy.name ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{task.createdBy.name}</Text>
            </View>
          </View>
        )}

        {task.assignedTo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>HJÄLPARE</Text>
            {task.assignedTo.id === user?.id ? (
              <View style={styles.userRow}>
                <View style={[styles.userAvatar, { backgroundColor: "#16A34A" }]}>
                  <Text style={styles.userAvatarText}>
                    {(task.assignedTo.name ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{task.assignedTo.name} (du)</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push(`/public-user?id=${task.assignedTo?.id}&taskId=${id}&from=${from}` as any)}
                style={styles.userRow}
              >
                <View style={[styles.userAvatar, { backgroundColor: "#16A34A" }]}>
                  <Text style={styles.userAvatarText}>
                    {(task.assignedTo.name ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{task.assignedTo.name}</Text>
                <Text style={styles.userArrow}>›</Text>
              </Pressable>
            )}
          </View>
        )}

        {task.offersCount != null && task.offersCount > 0 && (
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Erbjudanden</Text>
              <Text style={styles.detailValue}>{task.offersCount}</Text>
            </View>
          </View>
        )}

        {task.completedAt && (
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slutfört</Text>
              <Text style={styles.detailValue}>
                {task.completedAt.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {perms?.canOffer && (
            <Pressable
              style={({ pressed, hovered }: any) => [
                styles.primaryButton,
                hovered && styles.primaryButtonHovered,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => {/* TODO: offer flow */}}
            >
              <Text style={styles.primaryButtonText}>Hjälp till</Text>
            </Pressable>
          )}


          {perms?.canEdit && (
            <Pressable
              style={({ pressed }) => [styles.outlineButton, pressed && { opacity: 0.7 }]}
              onPress={openEditModal}
            >
              <Text style={styles.outlineButtonText}>Redigera</Text>
            </Pressable>
          )}

          {perms?.canCancel && (
            <Pressable
              onPress={handleCancel}
              disabled={cancelling}
              style={({ pressed, hovered }: any) => [
                styles.dangerButton,
                hovered && styles.dangerButtonHovered,
                pressed && styles.dangerButtonPressed,
              ]}
            >
              <Text style={styles.dangerButtonText}>
                {cancelling ? "Avbryter..." : "Avbryt uppdrag"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalOverlayTouchable}
              onPress={() => setShowEditModal(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Redigera uppdrag</Text>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.modalLabel}>Titel</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Titel"
                  placeholderTextColor="#a0a0a0"
                  style={styles.modalInput}
                />

                <Text style={styles.modalLabel}>Beskrivning</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Beskrivning"
                  placeholderTextColor="#a0a0a0"
                  style={[styles.modalInput, styles.modalTextArea]}
                  multiline
                />

                <Text style={styles.modalLabel}>Pris (valfritt)</Text>
                <TextInput
                  value={editPrice}
                  onChangeText={setEditPrice}
                  placeholder="Ersättning i kr"
                  placeholderTextColor="#a0a0a0"
                  keyboardType="number-pad"
                  style={styles.modalInput}
                />

                <Text style={styles.modalLabel}>Adress (valfritt)</Text>
                <TextInput
                  value={editStreet}
                  onChangeText={setEditStreet}
                  placeholder="Gatuadress"
                  placeholderTextColor="#a0a0a0"
                  style={styles.modalInput}
                />

                <Pressable
                  onPress={handleSaveEdit}
                  disabled={saving || !editTitle.trim() || !editDescription.trim()}
                  style={({ pressed }) => [
                    styles.saveButton,
                    (saving || !editTitle.trim() || !editDescription.trim()) && styles.saveButtonDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Spara ändringar</Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  },
  errorText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 16,
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  chatIconButton: {
    padding: 4,
  },
  chatIconText: {
    fontSize: 22,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16A34A",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  areaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  areaBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#16A34A",
  },
  locationIcon: {
    width: 14,
    height: 14,
  },
  dateText: {
    fontSize: 12,
    color: "#aaa",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  userArrow: {
    fontSize: 20,
    color: "#ccc",
  },
  actions: {
    marginTop: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonHovered: {
    backgroundColor: "#15913F",
    transform: [{ scale: 1.015 }],
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dangerButton: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  dangerButtonHovered: {
    backgroundColor: "#fee2e2",
    transform: [{ scale: 1.015 }],
  },
  dangerButtonPressed: {
    opacity: 0.8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
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
    maxHeight: "80%",
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
  saveButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
