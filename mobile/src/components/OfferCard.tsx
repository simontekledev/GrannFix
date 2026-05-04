import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { OfferResponse } from "@/src/api/generated/models/OfferResponse";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { resolveImageUrl } from "@/src/helpers/images";
import { timeAgo } from "@/src/helpers/time";

interface Props {
  offer: OfferResponse;
  isAccepting: boolean;
  onAccept: (offerId: string) => void;
  onPressHelper: (helperId: string) => void;
}

export function OfferCard({ offer, isAccepting, onAccept, onPressHelper }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={styles.offerItem}
      onPress={() => offer.helperId && onPressHelper(offer.helperId)}
    >
      {offer.helperProfileImageUrl ? (
        <Image
          source={{ uri: resolveImageUrl(offer.helperProfileImageUrl)! }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(offer.helperName ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {offer.helperName ?? "Hjälpare"}
        </Text>
        {offer.helperRatingCount != null && offer.helperRatingCount > 0 ? (
          <Text style={styles.rating}>
            ★ {offer.helperRatingAverage?.toFixed(1)} · {offer.helperRatingCount}{" "}
            {offer.helperRatingCount === 1 ? "omdöme" : "omdömen"}
          </Text>
        ) : (
          <Text style={styles.ratingEmpty}>Ny hjälpare</Text>
        )}
        {offer.proposedPrice != null && (
          <Text style={styles.price}>{offer.proposedPrice} kr</Text>
        )}
        {offer.message && (
          <Text style={styles.message} numberOfLines={2}>
            {offer.message}
          </Text>
        )}
        {offer.createdAt && (
          <Text style={styles.date}>{timeAgo(offer.createdAt)}</Text>
        )}
      </View>

      <Pressable
        onPress={() => offer.id && onAccept(offer.id)}
        disabled={isAccepting}
        style={({ pressed }) => [
          styles.acceptButton,
          pressed && { opacity: 0.7 },
          isAccepting && { opacity: 0.4 },
        ]}
      >
        <Text style={styles.acceptText}>{isAccepting ? "..." : "Acceptera"}</Text>
      </Pressable>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    offerItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    avatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
    },
    rating: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    ratingEmpty: {
      fontSize: 12,
      color: colors.textMuted,
      fontStyle: "italic",
    },
    price: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.accent,
    },
    message: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    date: {
      fontSize: 11,
      color: colors.textMuted,
    },
    acceptButton: {
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginLeft: 10,
    },
    acceptText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
