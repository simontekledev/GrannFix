import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { createModalStyles } from "@/src/styles/modal";
import { createFormStyles } from "@/src/styles/form";

export interface EditTaskPayload {
  title: string;
  description: string;
  price: number;
  street: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Should resolve when the task was saved (modal will then close). */
  onSave: (payload: EditTaskPayload) => Promise<void>;
  saving: boolean;
  initialValues: {
    title?: string | null;
    description?: string | null;
    price?: number | string | null;
    street?: string | null;
  };
}

export function EditTaskModal({
  visible,
  onClose,
  onSave,
  saving,
  initialValues,
}: Props) {
  const { colors } = useTheme();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
  const formStyles = useMemo(() => createFormStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [street, setStreet] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPrice(initialValues.price != null ? String(initialValues.price) : "");
    setStreet(initialValues.street ?? "");
  }, [visible, initialValues]);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : 0,
        street: street.trim(),
      });
      onClose();
    } catch {
      // Parent owns error UX; keep modal open
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={modalStyles.overlay}>
          <Pressable style={modalStyles.overlayTouchable} onPress={onClose} />
          <View style={modalStyles.content}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>Redigera uppdrag</Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={formStyles.label}>
                Titel <Text style={formStyles.required}>*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Titel"
                placeholderTextColor={colors.textMuted}
                style={formStyles.input}
              />

              <Text style={formStyles.label}>
                Beskrivning <Text style={formStyles.required}>*</Text>
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Beskrivning"
                placeholderTextColor={colors.textMuted}
                style={[formStyles.input, formStyles.textArea]}
                multiline
              />

              <Text style={formStyles.label}>
                Pris <Text style={formStyles.optional}>(valfritt)</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Ersättning i kr"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={formStyles.input}
              />

              <Text style={formStyles.label}>
                Adress <Text style={formStyles.optional}>(valfritt)</Text>
              </Text>
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="Gatuadress"
                placeholderTextColor={colors.textMuted}
                style={formStyles.input}
              />

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  !canSubmit && { opacity: 0.35 },
                  pressed && canSubmit && { opacity: 0.85 },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Spara ändringar</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      marginTop: 24,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
