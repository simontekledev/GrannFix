import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@/src/context/UserContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useUser();

  async function handleLogout() {
    await logout();
    router.replace("/(tabs)/profile");
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

  const ACCOUNT_ROWS = [
    { icon: require("@/assets/images/pen-icon.png"), label: "Redigera profil", onPress: () => router.push("/(tabs)/edit-profile") },
    { icon: require("@/assets/images/keylock-icon.png"), label: "Byt lösenord", onPress: () => router.push("/(tabs)/change-password") },
  ];

  const APP_ROWS = [
    { icon: require("@/assets/images/notification-icon.png"), label: "Notifikationer", onPress: () => {} },
    { icon: require("@/assets/images/info-icon.png"), label: "Om Grannfix", onPress: () => router.push("/(tabs)/about") },
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
          onPress={() => router.replace("/(tabs)/profile")}
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

        <Text style={styles.versionText}>Grannfix v1.0.0</Text>
      </ScrollView>
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
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 8,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
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
    backgroundColor: "#f5f5f5",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 20,
    height: 20,
    tintColor: "#4B5563",
    marginTop: 1,
  },
  rowText: {
    fontSize: 16,
    color: "#222",
  },
  rowArrow: {
    fontSize: 20,
    color: "#4B5563",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 36,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonHovered: {
    backgroundColor: "#fee2e2",
    transform: [{ scale: 1.015 }],
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#bbb",
    marginTop: 24,
  },
});
