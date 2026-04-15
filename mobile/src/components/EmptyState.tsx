import React, { useMemo } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

interface EmptyStateProps {
  icon?: string;
  iconImage?: ImageSourcePropType;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, iconImage, title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.centered}>
      <View style={styles.circle}>
        {iconImage ? (
          <Image source={iconImage} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Text style={styles.icon}>{icon}</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingVertical: 60,
    },
    circle: {
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: colors.accentMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    icon: {
      fontSize: 36,
    },
    iconImage: {
      width: 120,
      height: 120,
      tintColor: colors.accent,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
