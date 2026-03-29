import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { authApi, userApi } from "@/src/api/client";
import type { MeUserDto } from "@/src/api/generated/models/MeUserDto";

export default function ProfilScreen() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<MeUserDto | null>(null);

  // Login form
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  const loadProfile = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    const isLoggedIn = !!token;
    setLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      try {
        const me = await userApi.getMe();
        setUser(me);
      } catch (e: any) {
        console.log("Failed to load profile:", e);
        const status = e?.response?.status ?? e?.status;
        if (status === 401 || status === 403) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          setLoggedIn(false);
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
  }, []);

  // Load profile data once on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Only re-check auth status (local, no API call) on tab focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("access_token").then((token) => {
        const isLoggedIn = !!token;
        if (isLoggedIn !== loggedIn) {
          loadProfile();
        }
      });
    }, [loggedIn, loadProfile])
  );

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

      setEmail("");
      setPassword("");
      setLoggedIn(true);
      try {
        const me = await userApi.getMe();
        setUser(me);
      } catch (_) {}
    } catch (e: any) {
      console.log("Login error:", e);

      let msg = "Något gick fel. Försök igen.";
      const status = e?.response?.status ?? e?.status;
      if (status === 401 || status === 403) {
        msg = "Fel e-post eller lösenord. Kontrollera och försök igen.";
      } else if (status === 404) {
        msg = "Inget konto hittades med den e-postadressen.";
      } else if (status === 429) {
        msg = "För många försök. Vänta en stund och försök igen.";
      } else if (!status) {
        msg = "Kunde inte nå servern. Kontrollera din internetanslutning.";
      }

      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Inloggning misslyckades", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    setLoggedIn(false);
    setUser(null);
  }

  if (loggedIn === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      </SafeAreaView>
    );
  }

  // Logged in state
  if (loggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.profileScroll}>
          <View style={styles.profileHero}>
            <Image
              source={require("@/assets/images/user-profile-icon.png")}
              style={styles.profileIcon}
            />
            <Text style={styles.profileName}>{user?.name ?? "—"}</Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const avg = user?.ratingAverage ?? 0;
                const diff = avg - (star - 1);
                const fraction = Math.max(0, Math.min(1, diff));
                // Interpolate color from grey (#D1D5DB) to gold (#F59E0B)
                const r = Math.round(209 + (245 - 209) * fraction);
                const g = Math.round(213 + (158 - 213) * fraction);
                const b = Math.round(219 + (11 - 219) * fraction);
                return (
                  <Text key={star} style={[styles.star, { color: `rgb(${r},${g},${b})` }]}>
                    {"\u2605"}
                  </Text>
                );
              })}
              <Text style={styles.ratingText}>
                {(user?.ratingAverage ?? 0).toFixed(1)}
              </Text>
            </View>

            {user?.bio ? (
              <Text style={styles.bioText}>{user.bio}</Text>
            ) : null}

            {user?.verified ? (
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillText}>Verifierad</Text>
              </View>
            ) : (
              <View style={styles.unverifiedPill}>
                <Text style={styles.unverifiedPillText}>Ej verifierad</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Kontaktuppgifter</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>E-post</Text>
              <Text style={styles.detailValue}>{user?.email ?? "—"}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telefon</Text>
              <Text style={styles.detailValue}>{user?.phoneNumber ?? "—"}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Plats</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Stad</Text>
              <Text style={styles.detailValue}>{user?.city ?? "—"}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Område</Text>
              <Text style={styles.detailValue}>{user?.area ?? "—"}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (Platform.OS === "web") {
                if (window.confirm("Vill du logga ut?")) handleLogout();
              } else {
                Alert.alert("Logga ut", "Vill du logga ut?", [
                  { text: "Avbryt", style: "cancel" },
                  { text: "Logga ut", style: "destructive", onPress: handleLogout },
                ]);
              }
            }}
            style={({ pressed, hovered }: any) => [
              styles.logoutButton,
              hovered && styles.logoutButtonHovered,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.logoutButtonText}>Logga ut</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Not logged in — show login form + register link
  return (
    <SafeAreaView style={styles.safeLogin}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/grannfix-primary-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Logga in eller skapa ett konto</Text>

          <Text style={styles.label}>E-post</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            placeholder="din@email.com"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Lösenord</Text>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="Ange ditt lösenord"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            onPress={handleLogin}
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
              <Text style={styles.buttonText}>Logga in</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>eller</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={() => router.push("/register")}
            style={({ pressed, hovered }: any) => [
              styles.registerButton,
              hovered && styles.registerButtonHovered,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.registerButtonText}>Skapa konto</Text>
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
  safeLogin: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: -16,
  },
  logo: {
    width: 260,
    height: 260,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  profileScroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
  },
  profileHero: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 20,
  },
  profileIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 2,
  },
  star: {
    fontSize: 22,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginLeft: 6,
  },
  verifiedPill: {
    backgroundColor: "#f0fdf4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  verifiedPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
  },
  unverifiedPill: {
    backgroundColor: "#fef2f2",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  unverifiedPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  section: {
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e8e8e8",
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
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.8 },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: "#999",
  },
  registerButton: {
    borderWidth: 1,
    borderColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonHovered: {
    backgroundColor: "#f0fdf4",
    transform: [{ scale: 1.015 }],
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
  },
  logoutButton: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#e53e3e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonHovered: {
    backgroundColor: "#fef2f2",
    transform: [{ scale: 1.015 }],
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
  },
});
