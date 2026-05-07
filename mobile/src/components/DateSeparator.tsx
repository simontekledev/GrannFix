import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

interface Props {
  label: string;
}

export function DateSeparator({ label }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      marginVertical: 12,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      backgroundColor: colors.cardElevated,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: "hidden",
      textTransform: "capitalize",
    },
  });
}
