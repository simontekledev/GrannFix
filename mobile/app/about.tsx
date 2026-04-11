import React, { useMemo } from "react";
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
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

export default function AboutScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
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
            onPress={() => router.push("/terms")}
          >
            <Text style={styles.rowLabel}>Användarvillkor</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push("/privacy")}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.accent,
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
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 6,
      marginTop: 16,
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
    rowLabel: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    rowValue: {
      fontSize: 15,
      color: colors.textMuted,
    },
    rowLink: {
      fontSize: 15,
      color: "#3B82F6",
      fontWeight: "500",
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
    footer: {
      textAlign: "center",
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 32,
      opacity: 0.6,
    },
  });
}
