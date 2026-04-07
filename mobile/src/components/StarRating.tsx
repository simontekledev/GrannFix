import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  color?: "gold" | "green";
}

const COLORS = {
  gold: { filled: [245, 158, 11], empty: [209, 213, 219] },
  green: { filled: [22, 163, 74], empty: [209, 213, 219] },
};

export function StarRating({ rating, showValue = true, color = "gold" }: StarRatingProps) {
  const { filled, empty } = COLORS[color];
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const diff = rating - (star - 1);
        const fraction = Math.max(0, Math.min(1, diff));
        const r = Math.round(empty[0] + (filled[0] - empty[0]) * fraction);
        const g = Math.round(empty[1] + (filled[1] - empty[1]) * fraction);
        const b = Math.round(empty[2] + (filled[2] - empty[2]) * fraction);
        return (
          <Text key={star} style={[styles.star, { color: `rgb(${r},${g},${b})` }]}>
            {"\u2605"}
          </Text>
        );
      })}
      {showValue && (
        <Text style={styles.text}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 2,
  },
  star: {
    fontSize: 22,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginLeft: 6,
  },
});
