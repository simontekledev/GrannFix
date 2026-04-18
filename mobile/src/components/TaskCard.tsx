import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { timeAgo } from "@/src/helpers/time";
import { getCategoryEmoji, getUrgencyLabel, getUrgencyColor } from "@/src/helpers/categories";
import type { TaskResponse } from "@/src/api/generated/models/TaskResponse";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Öppen",
  ASSIGNED: "Tilldelad",
  COMPLETED: "Klar",
  CANCELLED: "Avbruten",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#22C55E",
  ASSIGNED: "#F59E0B",
  COMPLETED: "#6366F1",
  CANCELLED: "#EF4444",
};

interface TaskCardProps {
  task: TaskResponse;
  /** Show area badge with location icon */
  showArea?: boolean;
  /** Distance text (e.g. "1.2 km") */
  distanceText?: string | null;
  /** Show color-coded status badge */
  showStatus?: boolean;
  /** Show pending offers count badge */
  showOffers?: boolean;
  /** Show category emoji */
  showCategory?: boolean;
  /** Show a primary action button at the bottom */
  actionButton?: {
    label: string;
    onPress: () => void;
  };
  /** Extra query params for navigation */
  navigateParams?: string;
}

export function TaskCard({
  task,
  showArea = false,
  distanceText,
  showStatus = false,
  showOffers = false,
  showCategory = true,
  actionButton,
  navigateParams = "",
}: TaskCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const status = task.status ?? "OPEN";
  const statusColor = STATUS_COLORS[status] ?? "#888";
  const offersCount = task.pendingOffersCount;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/task-detail?id=${task.id}${navigateParams}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {task.title ?? "Uppdrag"}
        </Text>
        <View style={styles.cardHeaderRight}>
          {task.urgency && task.urgency !== "FLEXIBLE" && (
            <Text style={[styles.urgencyDot, { color: getUrgencyColor(task.urgency) }]}>
              {getUrgencyLabel(task.urgency)}
            </Text>
          )}
          {task.offeredPrice != null && (
            <View style={styles.priceBadge}>
              <Text style={styles.cardPrice}>{task.offeredPrice} kr</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardMeta}>
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
        )}
        {showOffers && offersCount != null && offersCount > 0 && (
          <View style={styles.offerBadge}>
            <View style={styles.offerDot} />
            <Text style={styles.offerBadgeText}>
              {offersCount} {offersCount === 1 ? "erbjudande" : "erbjudanden"}
            </Text>
          </View>
        )}
        {showArea && task.area && (
          <View style={styles.areaBadge}>
            <Image
              source={require("@/assets/images/location-icon-transparent.png")}
              style={styles.locationIcon}
            />
            <Text style={styles.areaBadgeText}>{task.area}</Text>
          </View>
        )}
        {distanceText && (
          <Text style={styles.cardDistance}>· {distanceText}</Text>
        )}
        {showCategory && task.category && (
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(task.category)}</Text>
        )}
      </View>

      {task.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        {task.createdAt && (
          <Text style={styles.cardDate}>{timeAgo(task.createdAt)}</Text>
        )}
        <Text style={styles.cardDetailLink}>Visa detaljer →</Text>
      </View>

      {actionButton && (
        <Pressable
          onPress={actionButton.onPress}
          style={({ pressed, hovered }: any) => [
            styles.actionButton,
            hovered && styles.actionButtonHovered,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionButtonText}>{actionButton.label}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 12,
    },
    priceBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    cardPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.accent,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
      flexWrap: "wrap",
    },
    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.cardElevated,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: "auto",
    },
    categoryEmoji: {
      fontSize: 12,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    urgencyDot: {
      fontSize: 12,
      fontWeight: "600",
    },
    cardHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: -2,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    offerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    offerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    offerBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.accent,
    },
    areaBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.accentMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 4,
    },
    locationIcon: {
      width: 14,
      height: 14,
    },
    areaBadgeText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
    },
    cardDistance: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
    },
    cardFooterRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardDate: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardDetailLink: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
    },
    actionButton: {
      marginTop: 14,
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
    actionButtonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
      shadowOpacity: 0.55,
      transform: [{ scale: 1.015 }],
    },
    actionButtonPressed: {
      opacity: 0.85,
      shadowOpacity: 0.25,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#fff",
      letterSpacing: 0.3,
    },
  });
}
