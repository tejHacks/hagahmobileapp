import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const scale = (size: number) => {
  if (isTablet) return size * 1.2;
  if (isSmallDevice) return size * 0.9;
  return size;
};

const tabs = [
  { label: "Declare", route: "/home/home", icon: "flame-outline", iconActive: "flame" },
  { label: "About", route: "/home/about", icon: "information-circle-outline", iconActive: "information-circle" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <View style={[styles.row, { height: scale(64) }]}>
        {tabs.map(({ label, route, icon, iconActive }) => {
          const isActive = pathname === route;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => router.replace(route as any)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[styles.indicator, { backgroundColor: isActive ? "#c9923a" : "transparent" }]} />
              <Ionicons
                name={(isActive ? iconActive : icon) as any}
                size={scale(22)}
                color={isActive ? "#c9923a" : "#5a3e1b"}
              />
              <Text style={[styles.label, { color: isActive ? "#f5d49a" : "#5a3e1b" }]}>
                {label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width,
    backgroundColor: "#120900",
    borderTopWidth: 1,
    borderTopColor: "rgba(201, 146, 58, 0.2)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: scale(8),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  indicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
  },
  label: {
    fontSize: scale(9),
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});