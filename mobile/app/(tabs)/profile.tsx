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
import { useTheme } from "@/src/context/ThemeContext";
import { ProfileSkeleton } from "@/src/components/Skeleton";
import { resolveImageUrl } from "@/src/helpers/images";
import { createProfileStyles } from "@/src/styles/screens/profile";

export default function ProfilScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user, loggedIn, loadProfile } = useUser();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => createProfileStyles(colors), [colors]);
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
      } else if (returnTo === "chat") {
        router.replace("/(tabs)/chat");
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
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: resolveImageUrl(user.profileImageUrl)! }}
                  style={styles.profileIcon}
                />
              ) : (
                <Image
                  source={
                    user?.role === "ADMIN"
                      ? require("@/assets/images/grannfix-icon.png")
                      : require("@/assets/images/user-profile1-icon.png")
                  }
                  style={styles.profileIcon}
                />
              )}
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

            {(user?.ratingCount ?? 0) > 0 && user?.id ? (
              <Pressable
                onPress={() =>
                  router.push(
                    `/user-reviews?id=${user.id}` as any
                  )
                }
                style={({ pressed }) => [styles.ratingPressable, pressed && { opacity: 0.6 }]}
              >
                <StarRating rating={user.ratingAverage ?? 0} color="green" />
                <Text style={styles.reviewsLink}>
                  {user.ratingCount === 1
                    ? "1 recension ›"
                    : `${user.ratingCount} recensioner ›`}
                </Text>
              </Pressable>
            ) : (
              <StarRating rating={user?.ratingAverage ?? 0} color="green" />
            )}

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
          <Text style={styles.subtitle}>Snabb hjälp nära dig</Text>

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
            onPress={() => router.push("/forgot-password")}
            style={({ pressed }) => [styles.forgotButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.forgotText}>Glömt lösenord?</Text>
          </Pressable>

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
