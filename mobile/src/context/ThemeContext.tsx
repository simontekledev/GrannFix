import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  card: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  accent: string;
  accentMuted: string;
  danger: string;
  headerGradient: [string, string];
  shadow: string;
}

const lightColors: ThemeColors = {
  background: "#f5faf2",
  card: "#ffffff",
  cardElevated: "#ffffff",
  textPrimary: "#111111",
  textSecondary: "#555555",
  textMuted: "#999999",
  border: "#e5e7eb",
  divider: "#f0f0f0",
  accent: "#16A34A",
  accentMuted: "#f0fdf4",
  danger: "#DC2626",
  headerGradient: ["#e8f5e9", "#f5faf2"],
  shadow: "#000000",
};

const darkColors: ThemeColors = {
  background: "#0f1411",
  card: "#1a221d",
  cardElevated: "#222b25",
  textPrimary: "#f0fdf4",
  textSecondary: "#cbd5d1",
  textMuted: "#9ca3af",
  border: "#2a3530",
  divider: "#1f2922",
  accent: "#22C55E",
  accentMuted: "#162a1d",
  danger: "#EF4444",
  headerGradient: ["#162a1d", "#0f1411"],
  shadow: "#000000",
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  colors: lightColors,
  setMode: async () => {},
  toggleMode: async () => {},
});

const STORAGE_KEY = "theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(async () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    await setMode(next);
  }, [mode, setMode]);

  const colors = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
