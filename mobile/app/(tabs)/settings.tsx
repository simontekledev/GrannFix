import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const router = useRouter();

  async function handleLogout() {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/(tabs)/profile")} style={styles.backButton}>
          <Text style={styles.backText}>{"‹"} Tillbaka</Text>
        </Pressable>
        <Text style={styles.title}>Inställningar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>KONTO</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {/* TODO: edit profile */}}
          >
            <Text style={styles.rowText}>Redigera profil</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {/* TODO: change password */}}
          >
            <Text style={styles.rowText}>Byt lösenord</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>APP</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {/* TODO: notifications settings */}}
          >
            <Text style={styles.rowText}>Notifikationer</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {/* TODO: about */}}
          >
            <Text style={styles.rowText}>Om Grannfix</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
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
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "500",
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
    marginTop: 16,
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
  rowText: {
    fontSize: 16,
    color: "#222",
  },
  rowArrow: {
    fontSize: 20,
    color: "#ccc",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 32,
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
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
  },
});
