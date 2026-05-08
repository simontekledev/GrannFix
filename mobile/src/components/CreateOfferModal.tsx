import React, { useMemo, useState } from "react";
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

export interface OfferPayload {
  price?: number;
  message?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Should resolve when the offer was submitted successfully (modal will then close + reset). */
  onSubmit: (payload: OfferPayload) => Promise<void>;
  submitting: boolean;
  /** Suggested price from the task, used as placeholder text when set. */
  suggestedPrice?: number | null;
}

export function CreateOfferModal({
  visible,
  onClose,
  onSubmit,
  submitting,
  suggestedPrice,
}: Props) {
  const { colors } = useTheme();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
  const formStyles = useMemo(() => createFormStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    const parsedPrice = price ? Number(price.replace(/[^0-9]/g, "")) || undefined : undefined;
    const trimmedMessage = message.trim() || undefined;
    try {
      await onSubmit({ price: parsedPrice, message: trimmedMessage });
      setPrice("");
      setMessage("");
      onClose();
    } catch {
      // Parent owns error UX; keep modal open so user can retry.
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
            <Text style={modalStyles.title}>Skicka erbjudande</Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={formStyles.label}>
                Pris <Text style={formStyles.optional}>(valfritt)</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder={
                  suggestedPrice ? `Föreslaget: ${suggestedPrice} kr` : "Ditt pris i kr"
                }
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={formStyles.input}
              />

              <Text style={formStyles.label}>
                Meddelande <Text style={formStyles.optional}>(valfritt)</Text>
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Berätta varför du kan hjälpa..."
                placeholderTextColor={colors.textMuted}
                style={[formStyles.input, formStyles.textArea]}
                multiline
              />

              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.button,
                  submitting && { opacity: 0.35 },
                  pressed && !submitting && { opacity: 0.85 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Skicka erbjudande</Text>
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
