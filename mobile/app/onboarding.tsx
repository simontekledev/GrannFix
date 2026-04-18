import React, { useRef, useState, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

const { width } = Dimensions.get("window");

const STORAGE_KEY = "onboarding_complete";

const PAGES = [
  {
    emoji: "📦",
    title: "Behöver du hjälp?",
    subtitle: "Publicera ett uppdrag och få erbjudanden från grannar nära dig",
  },
  {
    emoji: "💪",
    title: "Vill du hjälpa till?",
    subtitle: "Bläddra bland uppdrag i ditt område och tjäna pengar",
  },
  {
    emoji: "🤝",
    title: "Tryggt och lokalt",
    subtitle: "Chatta, betygsätt och hitta pålitliga hjälpare i ditt grannskap",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((done) => {
      if (done) router.replace("/(tabs)");
    });
  }, []);

  async function handleFinish() {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    router.replace("/(tabs)");
  }

  function handleNext() {
    if (currentIndex < PAGES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      handleFinish();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.skipRow}>
        {currentIndex < PAGES.length - 1 ? (
          <Pressable onPress={handleFinish} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.skipText}>Hoppa över</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.buttonText}>
            {currentIndex === PAGES.length - 1 ? "Kom igång" : "Nästa"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skipRow: {
      alignItems: "flex-end",
      paddingHorizontal: 24,
      paddingTop: 8,
      height: 40,
    },
    skipText: {
      fontSize: 15,
      color: colors.textMuted,
      fontWeight: "500",
    },
    page: {
      width,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingBottom: 60,
    },
    emoji: {
      fontSize: 80,
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 20,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.accent,
      width: 24,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
