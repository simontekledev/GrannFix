import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

interface Props {
  /** When non-null, renders the read-only "thanks for rating" state. */
  submittedRating: number | null;
  /** Current selected rating in the form (0-5). */
  ratingValue: number;
  onChangeRating: (value: number) => void;
  comment: string;
  onChangeComment: (value: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function RateHelperSection({
  submittedRating,
  ratingValue,
  onChangeRating,
  comment,
  onChangeComment,
  submitting,
  onSubmit,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (submittedRating != null) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>DITT BETYG</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              style={[styles.star, star <= submittedRating && styles.starFilled]}
            >
              ★
            </Text>
          ))}
        </View>
        <Text style={styles.thanks}>Tack för ditt betyg!</Text>
      </View>
    );
  }

  const canSubmit = ratingValue > 0 && !submitting;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BETYGSÄTT HJÄLPAREN</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChangeRating(star)}>
            <Text style={[styles.star, star <= ratingValue && styles.starFilled]}>★</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={comment}
        onChangeText={onChangeComment}
        placeholder="Valfri kommentar..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        multiline
        maxLength={500}
      />
      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.button,
          !canSubmit && { opacity: 0.35 },
          pressed && canSubmit && { opacity: 0.85 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Skicka betyg</Text>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginTop: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: colors.textMuted,
      marginBottom: 10,
    },
    stars: {
      flexDirection: "row",
      gap: 4,
    },
    star: {
      fontSize: 32,
      color: colors.border,
    },
    starFilled: {
      color: colors.accent,
    },
    thanks: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.background,
      marginTop: 12,
      minHeight: 80,
      textAlignVertical: "top",
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
