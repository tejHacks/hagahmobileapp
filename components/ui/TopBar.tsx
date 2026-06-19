import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function TopBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.row}>
        <View style={styles.titleGroup}>
          <Text style={styles.logo}>✦ HAGAH</Text>
          <Text style={styles.sub}>DAILY DECLARATION</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/home/settings" as any)}
          style={styles.settingsBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color="#5a3e1b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: "#120900",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 146, 58, 0.15)",
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    gap: 2,
  },
  logo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c9923a",
    letterSpacing: 4,
  },
  sub: {
    fontSize: 9,
    color: "#5a3e1b",
    letterSpacing: 3,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#2d1800",
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
});