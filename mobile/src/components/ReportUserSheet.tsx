import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { reportApi } from "@/src/api/client";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { createModalStyles } from "@/src/styles/modal";
import { CreateReportRequestReasonEnum } from "@/src/api/generated/models/CreateReportRequest";

type Reason = CreateReportRequestReasonEnum;

const REASONS: { key: Reason; label: string; emoji: string }[] = [
  { key: "HARASSMENT", label: "Trakasserier", emoji: "🚫" },
  { key: "SCAM", label: "Bedrägeri", emoji: "💸" },
  { key: "INAPPROPRIATE_BEHAVIOR", label: "Olämpligt beteende", emoji: "⚠️" },
  { key: "FAKE_PROFILE", label: "Falsk profil", emoji: "🎭" },
  { key: "SPAM", label: "Spam", emoji: "📨" },
  { key: "OTHER", label: "Annat", emoji: "•••" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName?: string;
  contextTaskId?: string;
  contextChatId?: string;
  onSuccess?: () => void;
}

export function ReportUserSheet({
  visible,
  onClose,
  reportedUserId,
  reportedUserName,
  contextTaskId,
  contextChatId,
  onSuccess,
}: Props) {
  const { colors } = useTheme();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [reason, setReason] = useState<Reason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setReason(null);
    setDescription("");
    setSubmitting(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await reportApi.createReport({
        createReportRequest: {
          reportedUserId,
          reason,
          description: description.trim() || undefined,
          contextTaskId,
          contextChatId,
        },
      });
      reset();
      onClose();
      onSuccess?.();
      const msg = "Tack för din rapport. Vi granskar den så snart som möjligt.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Rapport skickad", msg);
    } catch (e: any) {
      const msg = e?.response?.status === 409
        ? "Du har redan rapporterat denna användare nyligen."
        : "Kunde inte skicka rapporten. Försök igen.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Något gick fel", msg);
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={modalStyles.overlay}>
          <Pressable style={modalStyles.overlayTouchable} onPress={handleClose} />
          <View style={modalStyles.content}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>Rapportera användare</Text>
            {reportedUserName && (
              <Text style={styles.subtitle}>{reportedUserName}</Text>
            )}

            <Text style={styles.sectionLabel}>Anledning</Text>
            <View style={styles.reasonGrid}>
              {REASONS.map((r) => {
                const isActive = reason === r.key;
                return (
                  <Pressable
                    key={r.key}
                    onPress={() => setReason(r.key)}
                    style={[styles.reasonChip, isActive && styles.reasonChipActive]}
                  >
                    <Text style={styles.reasonEmoji}>{r.emoji}</Text>
                    <Text style={[styles.reasonText, isActive && styles.reasonTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Beskrivning (valfritt)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Berätta vad som hände..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!reason || submitting}
              style={({ pressed }) => [
                styles.submitButton,
                (!reason || submitting) && styles.submitButtonDisabled,
                pressed && reason && !submitting && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? "Skickar..." : "Skicka rapport"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: -8,
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 10,
    },
    reasonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    reasonChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reasonChipActive: {
      backgroundColor: "transparent",
      borderColor: colors.accent,
    },
    reasonEmoji: {
      fontSize: 14,
    },
    reasonText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    reasonTextActive: {
      color: colors.accent,
      fontWeight: "600",
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      fontSize: 14,
      color: colors.textPrimary,
      minHeight: 80,
      maxHeight: 140,
      marginBottom: 20,
    },
    submitButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.4,
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#fff",
    },
  });
}
