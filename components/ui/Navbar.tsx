import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
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
};

const tabs: Tab[] = [
  {
    label: "Home",
    route: "/home/home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    label: "War",
    route: "/home/war",
    icon: "shield-checkmark-outline",
    activeIcon: "shield-checkmark",
  },
  {
    label: "Bible",
    route: "/home/bible",
    icon: "book-outline",
    activeIcon: "book",
  },
  {
    label: "Pins",
    route: "/home/pins",
    icon: "bookmark-outline",
    activeIcon: "bookmark",
  },
  {
    label: "Settings",
    route: "/home/settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
];

function isRouteActive(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, width),
    [theme, width],
  );

  const isTablet = width >= 768;
  const horizontalMargin = isTablet ? 28 : 12;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 8) + 8,
          left: horizontalMargin,
          right: horizontalMargin,
        },
      ]}
    >
      <View style={styles.navbar}>
        {tabs.map((tab) => {
          const active = isRouteActive(pathname, tab.route);
          const isBible = tab.label === "Bible";

          return (
            <Pressable
              key={tab.label}
              onPress={() => {
                if (!active) {
                  router.replace(tab.route as never);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              {isBible ? (
                <View
                  style={[
                    styles.bibleButton,
                    active && styles.bibleButtonActive,
                    {
                      backgroundColor: active
                        ? theme.colors.accent
                        : theme.colors.navButton,
                      borderColor: active
                        ? theme.colors.accent
                        : theme.colors.navBorderStrong,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={24}
                    color={
                      active
                        ? theme.colors.onAccent
                        : theme.colors.textPrimary
                    }
                  />

                  {active && <View style={styles.bibleDot} />}
                </View>
              ) : (
                <View
                  style={[
                    styles.iconWrap,
                    active && {
                      backgroundColor: theme.colors.navActive,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={active ? 21 : 20}
                    color={
                      active
                        ? theme.colors.accent
                        : theme.colors.textMuted
                    }
                  />

                  {active && (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.activeLabel,
                        {
                          color: theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: Theme, width: number) {
  const c = theme.colors;
  const compact = width < 360;

  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      zIndex: 100,
      elevation: 20,
    },

    navbar: {
      height: compact ? 66 : 72,
      paddingHorizontal: compact ? 6 : 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      backgroundColor: c.navBackground,

      borderWidth: 1,
      borderColor: c.navBorder,
      borderRadius: 26,

      shadowColor: c.navShadow,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: Platform.OS === "ios" ? 0.22 : 0,
      shadowRadius: 24,

      elevation: Platform.OS === "android" ? 16 : 0,
    },

    tab: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    tabPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.97 }],
    },

    iconWrap: {
      minWidth: compact ? 44 : 50,
      height: compact ? 44 : 48,
      paddingHorizontal: 9,
      borderRadius: 17,

      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    },

    activeLabel: {
      marginTop: 2,
      fontSize: compact ? 8 : 9,
      fontWeight: "700",
      letterSpacing: 0.15,
    },

    bibleButton: {
      width: compact ? 52 : 58,
      height: compact ? 52 : 58,
      borderRadius: 29,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1.5,

      shadowColor: c.navShadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: Platform.OS === "ios" ? 0.24 : 0,
      shadowRadius: 12,

      elevation: Platform.OS === "android" ? 8 : 0,
    },

    bibleButtonActive: {
      transform: [{ translateY: -7 }],
      shadowOpacity: Platform.OS === "ios" ? 0.3 : 0,
      elevation: Platform.OS === "android" ? 12 : 0,
    },

    bibleDot: {
      position: "absolute",
      bottom: 5,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.onAccent,
    },
  });
}