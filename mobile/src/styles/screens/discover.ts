import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/src/context/ThemeContext";

export function createDiscoverStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeTop: {
      backgroundColor: colors.headerGradient[0],
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 12,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 7,
      fontSize: 15,
      color: colors.textPrimary,
      outlineStyle: "none",
      borderWidth: 1,
      borderColor: colors.border,
    } as any,
    sortButton: {
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortButtonInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    sortButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    locationIcon: {
      width: 14,
      height: 14,
    },
    locationIconSmall: {
      width: 18,
      height: 18,
    },
    sortButtonActive: {
      backgroundColor: "transparent",
      borderColor: colors.accent,
    },
    sortButtonTextActive: {
      color: colors.accent,
    },
    listTitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    headerSearchButton: {
      position: "absolute",
      right: 16,
      padding: 6,
    },
    headerSearchIcon: {
      width: 26,
      height: 26,
      tintColor: colors.textPrimary,
    },
    searchOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      zIndex: 10,
    },
    searchOverlayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 10,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    searchOverlayInput: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary,
      outlineStyle: "none",
    } as any,
    searchCancel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.accent,
    },
    searchEmptyText: {
      textAlign: "center",
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 40,
    },
    headerLogo: {
      width: 800,
      height: 195,
      marginVertical: -78,
    },
    headerLogoRow: {
      alignItems: "center",
    },
    wordmark: {
      width: 650,
      height: 160,
      marginVertical: -52,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 2,
    },
    list: {
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    emptyList: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    loginIcon: {
      width: 70,
      height: 70,
      tintColor: colors.accent,
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
    categoryScroll: {
      marginBottom: 12,
      marginHorizontal: -24,
    },
    categoryScrollContent: {
      paddingHorizontal: 24,
      gap: 10,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: "transparent",
      borderColor: colors.accent,
    },
    categoryChipEmoji: {
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
    filterScroll: {
      marginBottom: 8,
      marginHorizontal: -24,
    },
    filterScrollContent: {
      paddingHorizontal: 24,
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textMuted,
    },
    filterChipTextActive: {
      color: colors.accent,
      fontWeight: "600",
    },
    filterDivider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border,
    },
  });
}
