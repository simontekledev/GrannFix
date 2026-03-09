import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { authApi } from "@/src/api/client";

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      email.trim().length > 0 &&
      password.length > 0 &&
      name.trim().length > 0 &&
      phoneNumber.trim().length > 0 &&
      city.trim().length > 0 &&
      area.trim().length > 0
    );
  }, [email, password, name, phoneNumber, city, area, submitting]);

  async function handleRegister() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await authApi.register({
        registerRequest: {
          email: email.trim(),
          password,
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          city: city.trim(),
          area: area.trim(),
        },
      });

      // If your API returns tokens on register (often it does), save them:
      if (res?.accessToken) await AsyncStorage.setItem("access_token", res.accessToken);
      if (res?.refreshToken) await AsyncStorage.setItem("refresh_token", res.refreshToken);

      Alert.alert("✅ Account created", "You’re registered and ready to go.");

      // Send them to authenticated area (or back to login if you prefer)
      router.replace("/(tabs)/explore");
    } catch (e: any) {
      console.log("Register error:", e);

      const msg =
        e?.response?.status
          ? `HTTP ${e.response.status}`
          : e?.status
          ? `HTTP ${e.status}`
          : String(e?.message ?? e);

      Alert.alert("❌ Registration failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create account</ThemedText>

        <ThemedView style={styles.form}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <ThemedText type="subtitle">Email</ThemedText>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <ThemedText type="subtitle">Password</ThemedText>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <ThemedText type="subtitle">Phone number</ThemedText>
          <TextInput value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="+46..." placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <ThemedText type="subtitle">City</ThemedText>
          <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <ThemedText type="subtitle">Area</ThemedText>
          <TextInput value={area} onChangeText={setArea} placeholder="Area / district" placeholderTextColor="#999" style={styles.input} editable={!submitting} />

          <Pressable
            onPress={handleRegister}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
          >
            {submitting ? <ActivityIndicator /> : <ThemedText style={styles.buttonText}>Register</ThemedText>}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.linkButton}>
            <ThemedText style={styles.linkText}>Already have an account? Back to login</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 24 },
  form: { gap: 10, marginTop: 12 },
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
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontSize: 16 },
  linkButton: { marginTop: 12, alignItems: "center" },
  linkText: { textDecorationLine: "underline", opacity: 0.9 },
});