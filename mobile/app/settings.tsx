import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@/src/context/UserContext";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { userApi } from "@/src/api/client";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useUser();
  const { mode, colors, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    await logout();
    router.back();
  }

  function confirmLogout() {
    if (Platform.OS === "web") {
      if (window.confirm("Vill du logga ut?")) handleLogout();
    } else {
      Alert.alert("Logga ut", "Vill du logga ut?", [
        { text: "Avbryt", style: "cancel" },
        { text: "Logga ut", style: "destructive", onPress: handleLogout },
      ]);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await userApi.removeMe();
      await logout();
      router.replace("/(tabs)" as any);
    } catch (e) {
      console.log("Delete account error:", e);
      const msg = "Kunde inte radera kontot. Försök igen.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setDeleting(false);
    }
  }

  function confirmDeleteAccount() {
    const title = "Radera konto";
    const message =
      "Är du säker på att du vill radera ditt konto? Detta går inte att ångra. Dina öppna uppdrag kommer att avbrytas och din personliga information tas bort.";
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) handleDeleteAccount();
    } else {
      Alert.alert(title, message, [
        { text: "Avbryt", style: "cancel" },
        { text: "Radera konto", style: "destructive", onPress: handleDeleteAccount },
      ]);
    }
  }

  const ACCOUNT_ROWS = [
    { icon: require("@/assets/images/pen-icon.png"), label: "Redigera profil", onPress: () => router.push("/edit-profile") },
    { icon: require("@/assets/images/keylock-icon.png"), label: "Byt lösenord", onPress: () => router.push("/change-password") },
  ];

  const APP_ROWS = [
    { icon: require("@/assets/images/notification-icon.png"), label: "Notifikationer", onPress: () => router.push("/notifications") },
    { icon: require("@/assets/images/info-icon.png"), label: "Om Grannfix", onPress: () => router.push("/about") },
  ];

  function renderRow(item: { icon: any; label: string; onPress: () => void }, index: number, isLast: boolean) {
    return (
      <View key={index}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={item.onPress}
        >
          <View style={styles.rowLeft}>
            <Image source={item.icon} style={styles.rowIcon} resizeMode="contain" />
            <Text style={styles.rowText}>{item.label}</Text>
          </View>
          <Text style={styles.rowArrow}>›</Text>
        </Pressable>
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Profil</Text>
        </Pressable>
        <Text style={styles.title}>Inställningar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>KONTO</Text>
        <View style={styles.card}>
          {ACCOUNT_ROWS.map((item, i) => renderRow(item, i, i === ACCOUNT_ROWS.length - 1))}
        </View>

        <Text style={styles.sectionTitle}>APP</Text>
        <View style={styles.card}>
          {APP_ROWS.map((item, i) => renderRow(item, i, i === APP_ROWS.length - 1))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Image source={require("@/assets/images/theme-icon.png")} style={styles.rowIcon} resizeMode="contain" />
              <Text style={styles.rowText}>Mörkt tema</Text>
            </View>
            <Switch
              value={mode === "dark"}
              onValueChange={(v) => setMode(v ? "dark" : "light")}
              trackColor={{ false: "#d1d5db", true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <Pressable
          onPress={confirmLogout}
          style={({ pressed, hovered }: any) => [
            styles.logoutButton,
            hovered && styles.logoutButtonHovered,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Text style={styles.logoutButtonText}>Logga ut</Text>
        </Pressable>

        <Pressable
          onPress={confirmDeleteAccount}
          disabled={deleting}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && !deleting && { opacity: 0.7 },
          ]}
        >
          {deleting ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={styles.deleteButtonText}>Radera konto</Text>
          )}
        </Pressable>

        <Pressable
          onPress={async () => {
            const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
            await AsyncStorage.removeItem("onboarding_complete");
            if (Platform.OS === "web") window.alert("Onboarding reset! Starta om appen.");
            else Alert.alert("Reset", "Onboarding visas vid nästa omstart");
          }}
          style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.deleteButtonText}>Reset onboarding (debug)</Text>
        </Pressable>

        <Text style={styles.versionText}>Grannfix v1.0.0</Text>
      </ScrollView>
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
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 20,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    rowPressed: {
      backgroundColor: colors.divider,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rowIcon: {
      width: 20,
      height: 20,
      tintColor: colors.textSecondary,
      marginTop: 1,
    },
    rowText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    rowArrow: {
      fontSize: 20,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 16,
    },
    logoutButton: {
      marginTop: 36,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    logoutButtonHovered: {
      backgroundColor: colors.accentMuted,
      transform: [{ scale: 1.015 }],
    },
    logoutButtonPressed: {
      opacity: 0.8,
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.danger,
    },
    deleteButton: {
      marginTop: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textMuted,
      textDecorationLine: "underline",
    },
    versionText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 24,
      opacity: 0.6,
    },
  });
}
