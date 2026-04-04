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
import { userApi } from "@/src/api/client";
import { validatePassword } from "@/src/helpers/password";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const newPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const sameAsOld = newPassword.length > 0 && newPassword === currentPassword;
  const passwordError = newPassword.length > 0
    ? sameAsOld
      ? "Nya lösenordet kan inte vara samma som nuvarande"
      : validatePassword(newPassword)
    : null;

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      currentPassword.length > 0 &&
      passwordError === null &&
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      passwordsMatch
    );
  }, [currentPassword, newPassword, confirmPassword, passwordsMatch, passwordError, submitting]);

  async function handleChangePassword() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await userApi.changePassword({
        changePasswordRequest: {
          currentPassword,
          newPassword,
        },
      });

      if (Platform.OS === "web") {
        window.alert("Lösenordet har ändrats");
      } else {
        Alert.alert("Klart", "Ditt lösenord har ändrats");
      }
      router.back();
    } catch (e: any) {
      console.log("Change password error:", e);
      let msg = "Något gick fel. Försök igen.";
      const status = e?.response?.status ?? e?.status;
      if (status === 401) {
        msg = "Nuvarande lösenord är fel";
      } else if (!status) {
        msg = "Kunde inte nå servern. Kontrollera din internetanslutning.";
      }
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Fel", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
        <Text style={styles.title}>Byt lösenord</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Nuvarande lösenord</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Ange nuvarande lösenord"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
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
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            maxLength={64}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.label}>Bekräfta nytt lösenord</Text>
          <TextInput
            ref={confirmRef}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Skriv nya lösenordet igen"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleChangePassword}
          />
          {confirmPassword.length > 0 ? (
            passwordsMatch ? (
              <Text style={styles.successText}>Lösenorden matchar</Text>
            ) : (
              <Text style={styles.errorText}>Lösenorden matchar inte</Text>
            )
          ) : null}

          <Pressable
            onPress={handleChangePassword}
            disabled={!canSubmit}
            style={({ pressed, hovered }: any) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              hovered && canSubmit && styles.buttonHovered,
              pressed && canSubmit && styles.buttonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Byt lösenord</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 13,
    marginTop: 4,
  },
  successText: {
    color: "#16A34A",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    marginTop: 28,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonHovered: {
    backgroundColor: "#15913F",
    transform: [{ scale: 1.015 }],
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
