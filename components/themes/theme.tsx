/**
 * components/ui/themes/index.tsx
 * ---------------------------------------------------------------------------
 * HAGAH DESIGN SYSTEM
 *
 * Philosophy:
 * - Solid surfaces only
 * - Editorial Bible typography
 * - Quiet luxury, not excessive decoration
 * - Every theme uses the same semantic design tokens
 * - No theme-specific component logic
 * ---------------------------------------------------------------------------
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// ---------------------------------------------------------------------------
// Theme types
// ---------------------------------------------------------------------------

export type ThemeName =
    | "ancient"
    | "midnight"
    | "olive"
    | "parchment"
    | "royal"
    | "ember";

export interface ThemeColors {
    // -----------------------------------------------------------------------
    // Core surfaces
    // -----------------------------------------------------------------------

    bgBase: string;
    bgElevated: string;
    bgSurface: string;
    bgSunken: string;

    /**
     * Kept for backwards compatibility with existing components.
     *
     * IMPORTANT:
     * These are intentionally identical.
     * Hagah themes are now FLAT — no gradients.
     */
    gradientFrom: string;
    gradientTo: string;

    // -----------------------------------------------------------------------
    // Brand
    // -----------------------------------------------------------------------

    accent: string;
    onAccent: string;

    // -----------------------------------------------------------------------
    // Typography
    // -----------------------------------------------------------------------

    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textFaint: string;
    textDisabled: string;

    // -----------------------------------------------------------------------
    // Borders
    // -----------------------------------------------------------------------

    border: string;
    borderSubtle: string;
    borderStrong: string;

    // -----------------------------------------------------------------------
    // Overlay
    // -----------------------------------------------------------------------

    overlay: string;

    // -----------------------------------------------------------------------
    // Generic accent surfaces
    // -----------------------------------------------------------------------

    tint: string;
    tintActive: string;

    // -----------------------------------------------------------------------
    // Navigation
    // -----------------------------------------------------------------------

    navBackground: string;
    navBorder: string;
    navBorderStrong: string;
    navActive: string;
    navButton: string;
    navShadow: string;
}

// ---------------------------------------------------------------------------
// Theme object
// ---------------------------------------------------------------------------

export interface Theme {
    name: ThemeName;
    label: string;
    description: string;
    colors: ThemeColors;
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export const themes: Record<ThemeName, Theme> = {
    // =========================================================================
    // ANCIENT
    // =========================================================================
    // Warm brown — this is the evolution of the original Hagah identity.
    // =========================================================================

    ancient: {
        name: "ancient",
        label: "Ancient",
        description:
            "Warm earth, old parchment and antique gold — the original Hagah spirit.",

        colors: {
            bgBase: "#1B120B",
            bgElevated: "#24180E",
            bgSurface: "#2C1E12",
            bgSunken: "#110A06",

            gradientFrom: "#24180E",
            gradientTo: "#24180E",

            accent: "#C8A15A",
            onAccent: "#1B120B",

            textPrimary: "#F1E4CC",
            textSecondary: "#D8C09A",
            textMuted: "#A9906E",
            textFaint: "#6D5A43",
            textDisabled: "#392A1D",

            border: "rgba(200,161,90,0.20)",
            borderSubtle: "rgba(241,228,204,0.07)",
            borderStrong: "rgba(200,161,90,0.36)",

            overlay: "rgba(10,6,3,0.84)",

            tint: "rgba(200,161,90,0.08)",
            tintActive: "#C8A15A",

            navBackground: "#21150C",
            navBorder: "rgba(241,228,204,0.09)",
            navBorderStrong: "rgba(200,161,90,0.30)",
            navActive: "rgba(200,161,90,0.10)",
            navButton: "#2C1E12",
            navShadow: "#000000",
        },
    },

    // =========================================================================
    // MIDNIGHT
    // =========================================================================
    // Pure black + gold.
    // =========================================================================

    midnight: {
        name: "midnight",
        label: "Midnight",
        description:
            "Pure black and antique gold — restrained, cinematic and reverent.",

        colors: {
            bgBase: "#000000",
            bgElevated: "#090909",
            bgSurface: "#111111",
            bgSunken: "#000000",

            gradientFrom: "#090909",
            gradientTo: "#090909",

            accent: "#D4AF5A",
            onAccent: "#000000",

            // Gold hierarchy, as requested.
            textPrimary: "#D8B866",
            textSecondary: "#B9954A",
            textMuted: "#8A6D35",
            textFaint: "#5B4725",
            textDisabled: "#302516",

            border: "rgba(212,175,90,0.20)",
            borderSubtle: "rgba(212,175,90,0.08)",
            borderStrong: "rgba(212,175,90,0.40)",

            overlay: "rgba(0,0,0,0.90)",

            tint: "rgba(212,175,90,0.08)",
            tintActive: "#D4AF5A",

            navBackground: "#080808",
            navBorder: "rgba(212,175,90,0.12)",
            navBorderStrong: "rgba(212,175,90,0.34)",
            navActive: "rgba(212,175,90,0.10)",
            navButton: "#111111",
            navShadow: "#000000",
        },
    },

    // =========================================================================
    // OLIVE
    // =========================================================================
    // Much more mature than the old green.
    // =========================================================================

    olive: {
        name: "olive",
        label: "Olive",
        description:
            "Deep olive, bone white and muted brass — grounded and contemplative.",

        colors: {
            bgBase: "#101810",
            bgElevated: "#172119",
            bgSurface: "#1D2A20",
            bgSunken: "#0A100B",

            gradientFrom: "#172119",
            gradientTo: "#172119",

            accent: "#C4A45A",
            onAccent: "#101810",

            textPrimary: "#EEF0E7",
            textSecondary: "#CAD0C3",
            textMuted: "#96A18F",
            textFaint: "#66715F",
            textDisabled: "#374035",

            border: "rgba(196,164,90,0.18)",
            borderSubtle: "rgba(238,240,231,0.07)",
            borderStrong: "rgba(196,164,90,0.34)",

            overlay: "rgba(5,9,6,0.86)",

            tint: "rgba(196,164,90,0.08)",
            tintActive: "#C4A45A",

            navBackground: "#151F18",
            navBorder: "rgba(238,240,231,0.08)",
            navBorderStrong: "rgba(196,164,90,0.28)",
            navActive: "rgba(196,164,90,0.10)",
            navButton: "#1D2A20",
            navShadow: "#050806",
        },
    },

    // =========================================================================
    // PARCHMENT
    // =========================================================================
    // Light theme intended for long-form Scripture reading.
    // =========================================================================

    parchment: {
        name: "parchment",
        label: "Parchment",
        description:
            "Warm ivory, ink and muted brass — made for long reading sessions.",

        colors: {
            bgBase: "#F4EFE3",
            bgElevated: "#FBF8F0",
            bgSurface: "#EAE2D2",
            bgSunken: "#DDD3BF",

            gradientFrom: "#FBF8F0",
            gradientTo: "#FBF8F0",

            accent: "#876B35",
            onAccent: "#FFFDF7",

            textPrimary: "#29251E",
            textSecondary: "#51493B",
            textMuted: "#786F60",
            textFaint: "#9F9685",
            textDisabled: "#C7BFAF",

            border: "rgba(41,37,30,0.14)",
            borderSubtle: "rgba(41,37,30,0.07)",
            borderStrong: "rgba(135,107,53,0.28)",

            overlay: "rgba(41,37,30,0.38)",

            tint: "rgba(135,107,53,0.08)",
            tintActive: "#876B35",

            navBackground: "#FBF8F0",
            navBorder: "rgba(41,37,30,0.10)",
            navBorderStrong: "rgba(135,107,53,0.24)",
            navActive: "rgba(135,107,53,0.08)",
            navButton: "#EAE2D2",
            navShadow: "#8B806E",
        },
    },

    // =========================================================================
    // ROYAL
    // =========================================================================
    // A stronger navy alternative — not another purple theme.
    // =========================================================================

    royal: {
        name: "royal",
        label: "Royal",
        description:
            "Midnight navy, ivory and antique gold — regal without being loud.",

        colors: {
            bgBase: "#0B1220",
            bgElevated: "#121B2D",
            bgSurface: "#18233A",
            bgSunken: "#070C15",

            gradientFrom: "#121B2D",
            gradientTo: "#121B2D",

            accent: "#C7A55B",
            onAccent: "#0B1220",

            textPrimary: "#F1F0EA",
            textSecondary: "#CDD0D5",
            textMuted: "#9299A7",
            textFaint: "#616A7A",
            textDisabled: "#363D49",

            border: "rgba(199,165,91,0.18)",
            borderSubtle: "rgba(241,240,234,0.07)",
            borderStrong: "rgba(199,165,91,0.34)",

            overlay: "rgba(4,7,12,0.88)",

            tint: "rgba(199,165,91,0.08)",
            tintActive: "#C7A55B",

            navBackground: "#111A2B",
            navBorder: "rgba(241,240,234,0.08)",
            navBorderStrong: "rgba(199,165,91,0.28)",
            navActive: "rgba(199,165,91,0.10)",
            navButton: "#18233A",
            navShadow: "#02050A",
        },
    },

    // =========================================================================
    // EMBER
    // =========================================================================
    // Warfare-oriented but still elegant.
    // =========================================================================

    ember: {
        name: "ember",
        label: "Ember",
        description:
            "Charcoal, burnt copper and warm ivory — intensity without noise.",

        colors: {
            bgBase: "#160D0B",
            bgElevated: "#211412",
            bgSurface: "#2A1916",
            bgSunken: "#0B0605",

            gradientFrom: "#211412",
            gradientTo: "#211412",

            accent: "#CF8755",
            onAccent: "#160D0B",

            textPrimary: "#F3E8DE",
            textSecondary: "#D8C0B2",
            textMuted: "#A68B7D",
            textFaint: "#735B51",
            textDisabled: "#43332D",

            border: "rgba(207,135,85,0.19)",
            borderSubtle: "rgba(243,232,222,0.07)",
            borderStrong: "rgba(207,135,85,0.34)",

            overlay: "rgba(8,4,3,0.88)",

            tint: "rgba(207,135,85,0.08)",
            tintActive: "#CF8755",

            navBackground: "#1E1210",
            navBorder: "rgba(243,232,222,0.08)",
            navBorderStrong: "rgba(207,135,85,0.28)",
            navActive: "rgba(207,135,85,0.10)",
            navButton: "#2A1916",
            navShadow: "#050201",
        },
    },
};

// ---------------------------------------------------------------------------
// Theme order
// ---------------------------------------------------------------------------

export const themeOrder: ThemeName[] = [
    "ancient",
    "midnight",
    "olive",
    "parchment",
    "royal",
    "ember",
];

// ---------------------------------------------------------------------------
// Legacy theme migration
// ---------------------------------------------------------------------------

const legacyThemeAliases: Record<string, ThemeName> = {
    ancientSepia: "ancient",
    midnight: "midnight",
    sanctuary: "parchment",
    ancientScroll: "parchment",
    covenant: "olive",
    ember: "ember",

    // Previous redesign names
    nocturne: "midnight",
    scroll: "parchment",
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const STORAGE_KEY = "hagah_theme";

interface ThemeContextValue {
    themeName: ThemeName;
    theme: Theme;
    setThemeName: (name: ThemeName) => void;
    isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined,
);

export function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [themeName, setThemeNameState] =
        useState<ThemeName>("ancient");

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const saved = await AsyncStorage.getItem(
                    STORAGE_KEY,
                );

                if (!mounted) return;

                if (saved && saved in themes) {
                    setThemeNameState(
                        saved as ThemeName,
                    );
                } else if (
                    saved &&
                    legacyThemeAliases[saved]
                ) {
                    const migrated =
                        legacyThemeAliases[saved];

                    setThemeNameState(migrated);

                    await AsyncStorage.setItem(
                        STORAGE_KEY,
                        migrated,
                    );
                }
            } catch (error) {
                console.warn(
                    "Hagah theme load error:",
                    error,
                );
            } finally {
                if (mounted) {
                    setIsLoaded(true);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const setThemeName = (name: ThemeName) => {
        setThemeNameState(name);

        AsyncStorage.setItem(
            STORAGE_KEY,
            name,
        ).catch((error) => {
            console.warn(
                "Hagah theme save error:",
                error,
            );
        });
    };

    const value = useMemo<ThemeContextValue>(
        () => ({
            themeName,
            theme: themes[themeName],
            setThemeName,
            isLoaded,
        }),
        [themeName, isLoaded],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);

    if (!ctx) {
        throw new Error(
            "useTheme must be used within a ThemeProvider",
        );
    }

    return ctx;
}