import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/src/context/ThemeContext";

export function createFormStyles(colors: ThemeColors) {
  return StyleSheet.create({
    required: {
      color: colors.danger,
      fontWeight: "400",
    },
    optional: {
      color: colors.textMuted,
      fontWeight: "400",
      fontSize: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
  });
}
