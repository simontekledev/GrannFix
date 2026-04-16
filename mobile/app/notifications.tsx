import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

const STORAGE_KEY = "notification_settings";

interface NotificationSettings {
  pushEnabled: boolean;
  newOffers: boolean;
  offerAccepted: boolean;
  messages: boolean;
  taskUpdates: boolean;
  ratings: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  newOffers: true,
  offerAccepted: true,
  messages: true,
  taskUpdates: true,
  ratings: true,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch {}
      }
    });
  }, []);

  async function updateSetting<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function renderRow(label: string, description: string, key: keyof NotificationSettings, disabled?: boolean) {
    return (
      <View style={[styles.row, disabled && { opacity: 0.4 }]}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Switch
          value={disabled ? false : settings[key]}
          onValueChange={(v) => updateSetting(key, v)}
          trackColor={{ false: "#d1d5db", true: colors.accent }}
          thumbColor="#ffffff"
          disabled={disabled}
        />
      </View>
    );
  }

  const categoriesDisabled = !settings.pushEnabled;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
        <Text style={styles.title}>Notifikationer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>ALLMÄNT</Text>
        <View style={styles.card}>
          {renderRow(
            "Push-notiser",
            "Ta emot notiser på enheten",
            "pushEnabled"
          )}
        </View>

        <Text style={styles.sectionTitle}>KATEGORIER</Text>
        <View style={styles.card}>
          {renderRow(
            "Nya erbjudanden",
            "När någon lämnar ett bud på ditt uppdrag",
            "newOffers",
            categoriesDisabled
          )}
          <View style={styles.divider} />
          {renderRow(
            "Accepterade bud",
            "När en uppdragsgivare accepterar ditt bud",
            "offerAccepted",
            categoriesDisabled
          )}
          <View style={styles.divider} />
          {renderRow(
            "Meddelanden",
            "Nya chattmeddelanden",
            "messages",
            categoriesDisabled
          )}
          <View style={styles.divider} />
          {renderRow(
            "Uppdragsuppdateringar",
            "När ett uppdrag markeras som klart",
            "taskUpdates",
            categoriesDisabled
          )}
          <View style={styles.divider} />
          {renderRow(
            "Betyg",
            "När du får ett nytt betyg",
            "ratings",
            categoriesDisabled
          )}
        </View>

        <Text style={styles.footerText}>
          Notiser skickas via Firebase Cloud Messaging. Du kan alltid ändra dina systeminställningar i telefonens inställningar.
        </Text>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    rowText: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    rowDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 16,
    },
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
      marginTop: 24,
      paddingHorizontal: 8,
    },
  });
}
