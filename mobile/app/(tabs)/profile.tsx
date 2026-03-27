import React, { useCallback, useMemo, useState } from "react";
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
      } catch (e) {
        console.log("Failed to load profile:", e);
      }
    } else {
      setUser(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
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

      const msg =
        e?.response?.status
          ? `HTTP ${e.response.status}`
          : e?.status
          ? `HTTP ${e.status}`
          : String(e?.message ?? e);

      Alert.alert("Inloggning misslyckades", msg);
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
    const initials = (user?.name ?? "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Profil</Text>

          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.userName}>{user?.name ?? "—"}</Text>
              {user?.verified && (
                <Text style={styles.verifiedBadge}>Verifierad</Text>
              )}
            </View>
          </View>

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
            <View style={styles.detailDivider} />
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

          <View style={styles.section}>
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
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.logoutButtonText}>Logga ut</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Not logged in — show login form + register link
  return (
    <SafeAreaView style={styles.safe}>
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
          />

          <Text style={styles.label}>Lösenord</Text>
          <TextInput
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
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
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
            style={({ pressed }) => [
              styles.registerButton,
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  verifiedBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#111",
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
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#e53e3e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
  },
});
