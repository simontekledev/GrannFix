import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
}

export function StarRating({ rating, showValue = true }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const diff = rating - (star - 1);
        const fraction = Math.max(0, Math.min(1, diff));
        const r = Math.round(209 + (245 - 209) * fraction);
        const g = Math.round(213 + (158 - 213) * fraction);
        const b = Math.round(219 + (11 - 219) * fraction);
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
