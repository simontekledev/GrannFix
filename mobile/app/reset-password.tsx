import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authApi } from "@/src/api/client";
import { validatePassword } from "@/src/helpers/password";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const passwordError = newPassword.length > 0 ? validatePassword(newPassword) : null;

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      token.trim().length > 0 &&
      newPassword.length > 0 &&
      passwordError === null &&
      confirmPassword.length > 0 &&
      passwordsMatch
    );
  }, [token, newPassword, confirmPassword, passwordsMatch, passwordError, submitting]);

  async function handleReset() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword({
        resetPasswordRequest: {
          token: token.trim(),
          newPassword,
        },
      });
      if (Platform.OS === "web") {
        window.alert("Lösenordet har återställts. Du kan nu logga in.");
      } else {
        Alert.alert("Klart", "Lösenordet har återställts. Du kan nu logga in.");
      }
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      console.log("Reset password error:", e);
      const status = e?.response?.status ?? e?.status;
      let msg = "Något gick fel. Försök igen.";
      if (status === 400 || status === 404) {
        msg = "Ogiltig eller utgången kod. Begär en ny.";
      } else if (!status) {
        msg = "Kunde inte nå servern.";
      }
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backText}>← Tillbaka</Text>
          </Pressable>
          <Text style={styles.title}>Nytt lösenord</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            Ange koden du fick via e-post och välj ett nytt lösenord.
          </Text>

          <Text style={styles.label}>Återställningskod</Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="Klistra in koden från mailet"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />

          <Text style={styles.label}>Nytt lösenord</Text>
          <TextInput
            ref={newPasswordRef}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Minst 8 tecken"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            maxLength={64}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.label}>Bekräfta lösenord</Text>
          <TextInput
            ref={confirmRef}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Skriv nya lösenordet igen"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />
          {confirmPassword.length > 0 ? (
            passwordsMatch ? (
              <Text style={styles.successText}>Lösenorden matchar</Text>
            ) : (
              <Text style={styles.errorText}>Lösenorden matchar inte</Text>
            )
          ) : null}

          <Pressable
            onPress={handleReset}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && { opacity: 0.35 },
              pressed && canSubmit && { opacity: 0.8 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Återställ lösenord</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      marginBottom: 12,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    description: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 6,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 4,
    },
    successText: {
      color: colors.accent,
      fontSize: 13,
      marginTop: 4,
    },
    button: {
      marginTop: 28,
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
