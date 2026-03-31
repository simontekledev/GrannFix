import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  icon?: string;
  iconImage?: ImageSourcePropType;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, iconImage, title, subtitle }: EmptyStateProps) {
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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#f0fdf4",
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
    tintColor: "#16A34A",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 20,
  },
});
