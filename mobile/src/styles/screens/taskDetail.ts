import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/src/context/ThemeContext";

export function createTaskDetailStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 16,
    },
    backLink: {
      padding: 8,
    },
    backLinkText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
    },
    chatIconButton: {
      padding: 4,
    },
    chatIconText: {
      fontSize: 22,
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
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    priceBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    priceText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.accent,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    areaBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.accentMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    areaBadgeText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
    },
    locationIcon: {
      width: 14,
      height: 14,
    },
    dateText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardChatActive: {
      borderWidth: 1,
      borderColor: colors.accentMuted,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 10,
    },
    description: {
      fontSize: 15,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textMuted,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    userAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    userAvatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    userAvatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    userName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
    },
    userArrow: {
      fontSize: 20,
      color: colors.textMuted,
    },
    actions: {
      marginTop: 12,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    primaryButtonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
      transform: [{ scale: 1.015 }],
    },
    primaryButtonPressed: {
      opacity: 0.85,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    chatRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 8,
      backgroundColor: colors.accentMuted,
      borderRadius: 10,
      marginTop: 8,
    },
    chatBubble: {
      backgroundColor: colors.accentMuted,
      borderRadius: 10,
      padding: 8,
    },
    chatBubbleIcon: {
      width: 20,
      height: 20,
      tintColor: colors.accent,
    },
    chatRowText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.accent,
      flex: 1,
    },
    dangerButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    dangerButtonHovered: {
      backgroundColor: colors.accentMuted,
      transform: [{ scale: 1.015 }],
    },
    dangerButtonPressed: {
      opacity: 0.8,
    },
    dangerButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.danger,
    },
    outlineButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    outlineButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    offerHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    offersCountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    offersCountBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: "center",
    },
    offersCountText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.accent,
    },
    expandArrow: {
      fontSize: 10,
      color: colors.textMuted,
    },
    offersList: {
      marginTop: 8,
      gap: 8,
    },
    saveButton: {
      marginTop: 24,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonDisabled: {
      opacity: 0.35,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    taskImage: {
      width: 200,
      height: 150,
      borderRadius: 10,
    },
    infoBanner: {
      backgroundColor: colors.accentMuted,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    infoBannerText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.accent,
    },
  });
}
