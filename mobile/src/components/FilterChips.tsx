import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

interface Filter {
  key: string | null;
  label: string;
}

interface FilterChipsProps {
  filters: Filter[];
  active: string | null;
  onChange: (key: string | null) => void;
}

export function FilterChips({ filters, active, onChange }: FilterChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {filters.map((f) => (
        <Pressable
          key={f.key ?? "all"}
          onPress={() => onChange(active === f.key ? null : f.key)}
          style={[
            styles.chip,
            active === f.key && styles.chipActive,
          ]}
        >
          <Text style={[
            styles.chipText,
            active === f.key && styles.chipTextActive,
          ]}>
            {f.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: {
      marginBottom: 8,
      marginHorizontal: -24,
    },
    row: {
      paddingHorizontal: 24,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: "transparent",
      borderColor: colors.accent,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.accent,
      fontWeight: "600",
    },
  });
}
