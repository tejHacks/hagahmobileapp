/**
 * HAGAH DESIGN SYSTEM
 *
 * Two looks only: Light (warm paper, deep sage) and Dark (quiet near-black,
 * soft sage). By default Hagah follows the phone's appearance; the user can
 * pin Light or Dark in Settings. Every screen reads the same semantic tokens.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

/** The user's choice. "system" follows the phone. */
export type ThemeName = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

export interface ThemeColors {
  // Surfaces
  bgBase: string;
  bgElevated: string;
  bgSurface: string;
  bgSunken: string;
  /** Kept for older components; flat (no gradients). */
  gradientFrom: string;
  gradientTo: string;

  // Brand
  accent: string;
  onAccent: string;
  /** Warm highlight for streaks and small ornaments. */
  gold: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textDisabled: string;

  // Borders
  border: string;
  borderSubtle: string;
  borderStrong: string;

  overlay: string;

  tint: string;
  tintActive: string;

  // Navigation
  navBackground: string;
  navBorder: string;
  navBorderStrong: string;
  navActive: string;
  navButton: string;
  navShadow: string;
}

export interface Theme {
  name: ThemeName;
  scheme: Scheme;
  label: string;
  description: string;
  colors: ThemeColors;
}

const light: ThemeColors = {
  bgBase: "#F7F4EE",
  bgElevated: "#FFFFFF",
  bgSurface: "#FFFDF9",
  bgSunken: "#EFEAE1",
  gradientFrom: "#F7F4EE",
  gradientTo: "#F7F4EE",

  accent: "#2F5D50",
  onAccent: "#FFFFFF",
  gold: "#8A6516",

  textPrimary: "#1D1B17",
  textSecondary: "#3D3A33",
  textMuted: "#635D53",
  textFaint: "#8E877B",
  textDisabled: "#BDB6AA",

  border: "rgba(47,93,80,0.18)",
  borderSubtle: "rgba(29,27,23,0.08)",
  borderStrong: "rgba(47,93,80,0.34)",

  overlay: "rgba(20,18,14,0.55)",

  tint: "rgba(47,93,80,0.07)",
  tintActive: "#2F5D50",

  navBackground: "#FFFFFF",
  navBorder: "rgba(29,27,23,0.08)",
  navBorderStrong: "rgba(47,93,80,0.26)",
  navActive: "rgba(47,93,80,0.10)",
  navButton: "#F1EDE5",
  navShadow: "#000000",
};

const dark: ThemeColors = {
  bgBase: "#0F1312",
  bgElevated: "#161B19",
  bgSurface: "#1B211F",
  bgSunken: "#0A0D0C",
  gradientFrom: "#0F1312",
  gradientTo: "#0F1312",

  accent: "#8CCFB8",
  onAccent: "#0B1512",
  gold: "#E2BD62",

  textPrimary: "#ECE8DF",
  textSecondary: "#CFCAC0",
  textMuted: "#A39E94",
  textFaint: "#7A766E",
  textDisabled: "#46443F",

  border: "rgba(140,207,184,0.18)",
  borderSubtle: "rgba(236,232,223,0.07)",
  borderStrong: "rgba(140,207,184,0.34)",

  overlay: "rgba(0,0,0,0.72)",

  tint: "rgba(140,207,184,0.08)",
  tintActive: "#8CCFB8",

  navBackground: "#141917",
  navBorder: "rgba(236,232,223,0.08)",
  navBorderStrong: "rgba(140,207,184,0.26)",
  navActive: "rgba(140,207,184,0.12)",
  navButton: "#1E2522",
  navShadow: "#000000",
};

export const palettes: Record<Scheme, ThemeColors> = { light, dark };

/** One entry per choice in Settings. "system" previews the light palette. */
export const themes: Record<ThemeName, Theme> = {
  system: { name: "system", scheme: "light", label: "Match phone", description: "Light by day, dark by night, like your phone.", colors: light },
  light: { name: "light", scheme: "light", label: "Light", description: "Warm paper and deep sage.", colors: light },
  dark: { name: "dark", scheme: "dark", label: "Dark", description: "Quiet and easy on the eyes at night.", colors: dark },
};

export const themeOrder: ThemeName[] = ["system", "light", "dark"];

const STORAGE_KEY = "hagah_theme";

interface ThemeContextValue {
  /** The user's choice (system, light or dark). */
  themeName: ThemeName;
  /** The theme in use right now, with the system choice resolved. */
  theme: Theme;
  setThemeName: (name: ThemeName) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function resolveScheme(choice: ThemeName, phone: string | null | undefined): Scheme {
  if (choice === "light" || choice === "dark") return choice;
  return phone === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const phone = useColorScheme();
  const [themeName, setThemeNameState] = useState<ThemeName>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (saved === "system" || saved === "light" || saved === "dark") {
          setThemeNameState(saved);
        } else if (saved) {
          // Older versions had six colour themes; everyone moves to "Match phone".
          await AsyncStorage.setItem(STORAGE_KEY, "system");
        }
      } catch (error) {
        console.warn("Hagah theme load error:", error);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch((error) => console.warn("Hagah theme save error:", error));
  };

  const scheme = resolveScheme(themeName, phone);
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: { ...themes[scheme], name: themeName, colors: palettes[scheme] },
      setThemeName,
      isLoaded,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeName, scheme, isLoaded],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
