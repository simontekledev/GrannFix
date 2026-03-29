import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {filters.map((f) => (
          <Pressable
            key={f.key ?? "all"}
            onPress={() => onChange(f.key)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  row: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipActive: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#fff",
  },
});
