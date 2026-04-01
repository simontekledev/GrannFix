import React from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/(tabs)/settings")}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/grannfix-primary-transparent-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.description}>
          Grannfix kopplar ihop grannar som behöver hjälp med de som kan hjälpa till — från småfixar till vardagssysslor.
        </Text>

        <Text style={styles.sectionTitle}>INFO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plattform</Text>
            <Text style={styles.rowValue}>iOS & Android</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>KONTAKT</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => Linking.openURL("mailto:support@grannfix.se")}
          >
            <Text style={styles.rowLabel}>E-post</Text>
            <Text style={styles.rowLink}>support@grannfix.se</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>JURIDISKT</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push("/(tabs)/terms")}
          >
            <Text style={styles.rowLabel}>Användarvillkor</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push("/(tabs)/privacy")}
          >
            <Text style={styles.rowLabel}>Integritetspolicy</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Gjord med kärlek i Stockholm</Text>
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
    paddingBottom: 12,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: -20,
  },
  logo: {
    width: 240,
    height: 240,
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 6,
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
  rowLabel: {
    fontSize: 16,
    color: "#222",
  },
  rowValue: {
    fontSize: 15,
    color: "#888",
  },
  rowLink: {
    fontSize: 15,
    color: "#3B82F6",
    fontWeight: "500",
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
  footer: {
    textAlign: "center",
    fontSize: 13,
    color: "#bbb",
    marginTop: 32,
  },
});
