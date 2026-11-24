import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Theme, useTheme } from "../themes/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type Tab = {
  label: string;
  route: string;
  icon: IoniconName;
  activeIcon: IoniconName;
  /** Other screens that belong to this tab. */
  also?: string[];
};

const tabs: Tab[] = [
  { label: "Home", route: "/home/home", icon: "home-outline", activeIcon: "home", also: ["/home/declare"] },
  { label: "War", route: "/home/war", icon: "shield-outline", activeIcon: "shield" },
  { label: "Bible", route: "/home/bible", icon: "book-outline", activeIcon: "book", also: ["/home/search"] },
  { label: "Pins", route: "/home/pins", icon: "bookmark-outline", activeIcon: "bookmark" },
  { label: "Settings", route: "/home/settings", icon: "options-outline", activeIcon: "options", also: ["/home/about"] },
];

const BIBLE_INDEX = 2;
const DOCK_HEIGHT = 64;

/** Height a screen should leave clear at the bottom of its scroll content. */
export const NAVBAR_SPACE = 120;

function matches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function activeIndexFor(pathname: string) {
  return tabs.findIndex((t) => matches(pathname, t.route) || t.also?.some((r) => matches(pathname, r)));
}

// Each screen mounts its own navbar, so remember where the highlight was
// and let it glide from the previous tab to the new one.
let lastIndex = 0;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const activeIndex = activeIndexFor(pathname);
  const margin = width >= 768 ? Math.max(28, (width - 560) / 2) : 14;
  const dockWidth = width - margin * 2;
  const tabWidth = (dockWidth - 12) / tabs.length;

  const [slide] = useState(() => new Animated.Value(lastIndex));
  const [lift] = useState(() => new Animated.Value(lastIndex === BIBLE_INDEX ? 1 : 0));

  useEffect(() => {
    if (activeIndex < 0) return;
    lastIndex = activeIndex;
    Animated.parallel([
      Animated.spring(slide, { toValue: activeIndex, useNativeDriver: true, damping: 18, stiffness: 180, mass: 0.9 }),
      Animated.timing(lift, {
        toValue: activeIndex === BIBLE_INDEX ? 1 : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex, slide, lift]);

  const pillWidth = Math.min(tabWidth - 6, 64);
  const pillX = slide.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => 6 + i * tabWidth + (tabWidth - pillWidth) / 2),
  });
  // The Bible seal carries its own highlight, so the pill fades out over it.
  const pillOpacity = slide.interpolate({
    inputRange: [BIBLE_INDEX - 1, BIBLE_INDEX - 0.5, BIBLE_INDEX, BIBLE_INDEX + 0.5, BIBLE_INDEX + 1],
    outputRange: [1, 0.4, 0, 0.4, 1],
    extrapolate: "clamp",
  });
  const sealLift = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const ringOpacity = lift;

  const bottom = Math.max(insets.bottom, 10) + 6;

  return (
    <View pointerEvents="box-none" style={[styles.root, { height: bottom + DOCK_HEIGHT + 40 }]}>
      <LinearGradient
        pointerEvents="none"
        colors={[theme.colors.bgBase + "00", theme.colors.bgBase + "E6", theme.colors.bgBase]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.dock, { bottom, left: margin, right: margin }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { width: pillWidth, opacity: activeIndex < 0 ? 0 : pillOpacity, transform: [{ translateX: pillX }] },
          ]}
        />

        {tabs.map((tab, i) => {
          const active = i === activeIndex;
          const isBible = i === BIBLE_INDEX;

          const onPress = () => {
            if (active) return;
            if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => { });
            router.replace(tab.route as never);
          };

          return (
            <Pressable
              key={tab.label}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.tab, { width: tabWidth }, pressed && { opacity: 0.6 }]}
            >
              {isBible ? (
                <Animated.View style={[styles.sealWrap, { transform: [{ translateY: sealLift }] }]}>
                  <Animated.View style={[styles.sealRing, { opacity: ringOpacity }]} />
                  <View style={styles.seal}>
                    <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={theme.colors.onAccent} />
                  </View>
                </Animated.View>
              ) : (
                <>
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={21}
                    color={active ? theme.colors.accent : theme.colors.textMuted}
                  />
                  <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  const dark = theme.scheme === "dark";

  return StyleSheet.create({
    root: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      elevation: 20,
    },
    dock: {
      position: "absolute",
      height: DOCK_HEIGHT,
      paddingHorizontal: 6,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.navBackground,
      borderRadius: 24,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: dark ? "rgba(236,232,223,0.10)" : "rgba(29,27,23,0.10)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: dark ? 0.5 : 0.12,
      shadowRadius: 24,
      elevation: 14,
    },
    pill: {
      position: "absolute",
      left: 0,
      top: 7,
      bottom: 7,
      borderRadius: 16,
      backgroundColor: c.navActive,
    },
    tab: {
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    label: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.2,
      color: c.textFaint,
    },
    labelActive: { color: c.accent, fontWeight: "700" },

    sealWrap: { width: 54, height: 54, alignItems: "center", justifyContent: "center", marginTop: -14 },
    sealRing: {
      position: "absolute",
      width: 62,
      height: 62,
      borderRadius: 31,
      borderWidth: 1.5,
      borderColor: c.gold,
    },
    seal: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.accent,
      borderWidth: 3,
      borderColor: c.navBackground,
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: dark ? 0.35 : 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
  });
}
