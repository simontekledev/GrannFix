import React, { useMemo, useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authApi } from "@/src/api/client";

const host = Constants.expoConfig?.hostUri?.split(":")[0];
const BASE_URL = `http://${host}:8080`;

export default function HomeScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    // very light validation; keep it simple
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  async function handleLogin() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await authApi.login({
        loginRequest: {
          email: email.trim(),
          password,
        },
      });

      if (res.accessToken) {
        await AsyncStorage.setItem("access_token", res.accessToken);
      }
      if (res.refreshToken) {
        await AsyncStorage.setItem("refresh_token", res.refreshToken);
      }

      Alert.alert(
        "✅ Logged in",
        `User: ${res.user?.id ?? "(no id)"}\nToken saved: ${
          res.accessToken ? "yes" : "no"
        }`
      );

      // OPTIONAL: navigate somewhere after login
      // Change "/(tabs)/explore" to wherever your authenticated landing page is.
      router.replace("/(tabs)/explore");
    } catch (e: any) {
      console.log("Login error:", e);

      const msg =
        e?.response?.status
          ? `HTTP ${e.response.status}`
          : e?.status
          ? `HTTP ${e.status}`
          : String(e?.message ?? e);

      Alert.alert("❌ Login failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Sign in</ThemedText>

        <ThemedText style={{ marginTop: 8 }}>
          API Base URL:{" "}
          <ThemedText type="defaultSemiBold">{BASE_URL}</ThemedText>
        </ThemedText>

        <ThemedView style={styles.form}>
          <ThemedText type="subtitle">Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            placeholder="you@example.com"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
            returnKeyType="next"
          />

          <ThemedText type="subtitle">Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="••••••••"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
              onPress={handleLogin}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && canSubmit && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <ThemedText style={styles.buttonText}>Log in</ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/register")}
              style={styles.linkButton}
            >
              <ThemedText style={styles.linkText}>
                Don’t have an account? Register
              </ThemedText>
            </Pressable>

          <ThemedText style={styles.hint}>
            Tip: On{" "}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: "iOS",
                android: "Android",
                web: "web",
              })}
            </ThemedText>
            , make sure your phone/emulator can reach{" "}
            <ThemedText type="defaultSemiBold">{BASE_URL}</ThemedText>.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 24,
  },
  form: {
    gap: 10,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
  },
  hint: {
    marginTop: 6,
    opacity: 0.8,
    lineHeight: 18,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  linkButton: { marginTop: 12, alignItems: "center" },
  linkText: { textDecorationLine: "underline", opacity: 0.9 },
});