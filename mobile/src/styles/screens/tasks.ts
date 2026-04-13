import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/src/context/ThemeContext";

export function createTasksStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    headerRow: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 12,
    },
    title: {
      fontSize: 23,
      fontWeight: "700",
      color: colors.textPrimary,
      marginLeft: -2,
      letterSpacing: -1.0,
    },
    subtitle: {
      alignSelf: "flex-start",
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 14,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 16,
    },
    list: {
      paddingHorizontal: 24,
      paddingBottom: 90,
    },
    centeredColumn: {
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 60,
    },
    loginContent: {
      alignItems: "center",
      paddingHorizontal: 32,
    },
    loginIcon: {
      width: 70,
      height: 70,
      tintColor: colors.textMuted,
      marginBottom: 16,
    },
    loginTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 6,
    },
    loginSubtitle: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    loginButtonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
      transform: [{ scale: 1.015 }],
    },
    loginButton: {
      marginTop: 6,
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 40,
    },
    loginButtonPressed: {
      opacity: 0.8,
    },
    loginButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
    areaList: {
      maxHeight: 150,
      backgroundColor: colors.background,
      borderRadius: 12,
      marginTop: 4,
    },
    areaItem: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    areaItemText: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    areaSelectedText: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    areaPlaceholderText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    createButton: {
      marginTop: 24,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    createButtonDisabled: {
      opacity: 0.35,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    fabPressed: {
      opacity: 0.85,
    },
    fabText: {
      fontSize: 28,
      fontWeight: "400",
      color: "#fff",
      marginTop: -2,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    categoryEmoji: {
      fontSize: 16,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    categoryChipTextActive: {
      color: colors.accent,
      fontWeight: "600",
    },
  });
}
