import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authApi } from "@/src/api/client";
import { StarRating } from "@/src/components/StarRating";
import { useUser } from "@/src/context/UserContext";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { ProfileSkeleton } from "@/src/components/Skeleton";

export default function ProfilScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user, loggedIn, loadProfile } = useUser();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }


  // Login form
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
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

      setEmail("");
      setPassword("");
      await loadProfile();

      if (returnTo === "index") {
        router.replace("/(tabs)" as any);
      } else if (returnTo === "tasks") {
        router.replace("/(tabs)/tasks");
      }
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


  if (loggedIn === null) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  // Logged in state
  if (loggedIn) {
    return (
      <View style={styles.safe}>
        <SafeAreaView style={{ backgroundColor: colors.headerGradient[0] }} edges={["top"]}>
          <LinearGradient colors={colors.headerGradient} style={styles.profileGradientHeader}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
            >
              <Image
                source={require("@/assets/images/settings-icon- black-transparent.png")}
                style={styles.settingsIcon}
                resizeMode="contain"
              />
            </Pressable>
          </LinearGradient>
        </SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.profileScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          <View style={styles.profileHero}>
            <View style={styles.profileIconWrapper}>
              <Image
                source={
                  (user as any)?.role === "ADMIN"
                    ? require("@/assets/images/grannfix-icon.png")
                    : require("@/assets/images/user-profile1-icon.png")
                }
                style={styles.profileIcon}
              />
              {user?.verified && (
                <View style={styles.verifiedIconWrapper}>
                  <Image
                    source={require("@/assets/images/verified-icon.png")}
                    style={styles.verifiedIcon}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{user?.name ?? "—"}</Text>

            <StarRating rating={user?.ratingAverage ?? 0} color="green" />

            {user?.bio ? (
              <Text style={styles.bioText}>{user.bio}</Text>
            ) : null}
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
            {user?.street ? (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Adress</Text>
                  <Text style={styles.detailValue}>{user.street}</Text>
                </View>
              </>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Statistik</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Medlem sedan</Text>
              <Text style={styles.detailValue}>
                {user?.createdAt
                  ? user.createdAt.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slutförda uppdrag</Text>
              <Text style={styles.detailValue}>
                {(user?.completedOffersCount ?? 0) === 0
                  ? "Inga slutförda uppdrag"
                  : (user?.completedOffersCount ?? 0) === 1
                  ? "1 slutfört uppdrag"
                  : `${user?.completedOffersCount ?? 0} slutförda uppdrag`}
              </Text>
            </View>
          </View>

        </ScrollView>
      </View>
    );
  }

  // Not logged in — show login form + register link
  return (
    <SafeAreaView style={styles.safeLogin} edges={["top"]}>
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
              source={
                mode === "dark"
                  ? require("@/assets/images/grannfix-primary-transparent-logo-dark.png")
                  : require("@/assets/images/grannfix-primary-transparent-logo.png")
              }
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
            placeholderTextColor={colors.textMuted}
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
            placeholderTextColor={colors.textMuted}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeLogin: {
      flex: 1,
      backgroundColor: colors.background,
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
      marginTop: 40,
      marginBottom: -16,
    },
    logo: {
      width: 260,
      height: 260,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: "center",
    },
    profileGradientHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
    },
    profileScroll: {
      paddingHorizontal: 24,
      paddingTop: 0,
      paddingBottom: 48,
    },
    settingsButton: {
      padding: 6,
    },
    settingsIcon: {
      width: 26,
      height: 26,
      opacity: 0.7,
      tintColor: colors.textPrimary,
    },
    profileHero: {
      alignItems: "center",
      marginBottom: 28,
      marginTop: 4,
    },
    profileIconWrapper: {
      position: "relative",
      marginBottom: 14,
    },
    profileIcon: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profileName: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    bioText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 10,
      paddingHorizontal: 12,
    },
    verifiedText: {
      fontSize: 13,
      fontWeight: "500",
      color: "#3B82F6",
      marginTop: 2,
      marginBottom: 4,
    },
    verifiedPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      backgroundColor: "#E0ECFF",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      marginTop: 4,
    },
    verifiedIconWrapper: {
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 2,
    },
    verifiedIcon: {
      width: 24,
      height: 24,
    },
    verifiedPillText: {
      fontSize: 13,
      fontWeight: "500",
      color: "#3B82F6",
      opacity: 0.85,
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
      color: colors.textMuted,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
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
      color: colors.textMuted,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textPrimary,
      textAlign: "right",
      flex: 1,
      marginLeft: 16,
    },
    detailDivider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    section: {
      marginTop: 32,
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
    button: {
      marginTop: 28,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
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
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 13,
      color: colors.textMuted,
    },
    registerButton: {
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    registerButtonHovered: {
      backgroundColor: colors.accentMuted,
      transform: [{ scale: 1.015 }],
    },
    registerButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.accent,
    },
  });
}
