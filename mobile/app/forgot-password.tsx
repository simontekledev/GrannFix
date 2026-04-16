import React, { useMemo, useState } from "react";
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
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 0 && !submitting;

  async function handleSend() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await authApi.forgotPassword({
        forgotPasswordRequest: { email: email.trim() },
      });
      setSent(true);
    } catch (e: any) {
      console.log("Forgot password error:", e);
      const status = e?.response?.status ?? e?.status;
      let msg = "Något gick fel. Försök igen.";
      if (status === 404) {
        msg = "Inget konto hittades med den e-postadressen.";
      } else if (status === 429) {
        msg = "För många försök. Vänta en stund.";
      } else if (!status) {
        msg = "Kunde inte nå servern.";
      }
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backText}>← Logga in</Text>
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Text style={styles.sentTitle}>Kolla din e-post</Text>
          <Text style={styles.sentSubtitle}>
            Vi har skickat en återställningskod till {email.trim()}
          </Text>
          <View style={styles.sentActions}>
            <Pressable
              onPress={() => router.push("/reset-password")}
              style={({ pressed }) => [styles.sentButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.buttonText}>Jag har koden</Text>
            </Pressable>
            <Pressable
              onPress={() => setSent(false)}
              style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText}>Skicka igen</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
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
            <Text style={styles.backText}>← Logga in</Text>
          </Pressable>
          <Text style={styles.title}>Glömt lösenord</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            Ange din e-postadress så skickar vi en kod för att återställa ditt lösenord.
          </Text>

          <Text style={styles.label}>E-post</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="din@email.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />

          <Pressable
            onPress={handleSend}
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
              <Text style={styles.buttonText}>Skicka återställningslänk</Text>
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
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: 80,
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
    sentTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 10,
      textAlign: "center",
    },
    sentSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    sentActions: {
      width: "100%",
      paddingHorizontal: 24,
      alignItems: "center",
    },
    sentButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    linkButton: {
      marginTop: 20,
    },
    linkText: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: "600",
    },
  });
}
