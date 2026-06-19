import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../../components/ui/Navbar";
import TopBar from "../../components/ui/TopBar";
import { declarations } from "../../data/declarations";

import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

function getDailyDeclaration() {
  const start = new Date("2025-01-01").getTime();
  const now = new Date().getTime();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return declarations[dayIndex % declarations.length];
}

export default function HomeScreen() {
  const daily = getDailyDeclaration();
  const [meditateCount, setMeditateCount] = useState(0);
  const done = meditateCount >= 5;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Scripture Band */}
        <View style={styles.scriptureBand}>
          <Text style={styles.scriptureRef}>{daily.ref}</Text>
          <Text style={styles.scriptureText}>"{daily.scripture}"</Text>
        </View>

        {/* Declaration Card */}
        <View style={styles.declarationCard}>
          <Text style={styles.declLabel}>TODAY'S DECLARATION</Text>
          <Text style={styles.declText}>{daily.declaration}</Text>
        </View>

        {/* Meditate Tracker */}
        <View style={styles.meditateCard}>
          <Text style={styles.meditateLabel}>MEDITATE ON IT 5×</Text>
          <View style={styles.dotRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setMeditateCount(i + 1)}
                style={[styles.dot, i < meditateCount && styles.dotFilled]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.meditateBtn, done && styles.meditateBtnDone]}
            onPress={() => !done && setMeditateCount((c) => c + 1)}
            activeOpacity={0.85}
            disabled={done}
          >
            <Text style={[styles.meditateBtnText, done && styles.meditateBtnTextDone]}>
              {done ? "✓ Meditation Complete" : `Declare It Aloud (${meditateCount}/5)`}
            </Text>
          </TouchableOpacity>
          {done && (
            <Text style={styles.completeMsg}>
              🔥 Well done! Come back tomorrow for a new declaration.
            </Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f00" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  scriptureBand: {
    backgroundColor: "#2d1800",
    borderRadius: 10,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  scriptureRef: {
    fontSize: 11,
    color: "#c9923a",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "700",
  },
  scriptureText: {
    fontSize: 13,
    color: "rgba(201, 146, 58, 0.6)",
    fontStyle: "italic",
    lineHeight: 20,
  },
  declarationCard: {
    backgroundColor: "#120900",
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.15)",
  },
  declLabel: {
    fontSize: 10,
    color: "rgba(201, 146, 58, 0.5)",
    letterSpacing: 2,
    marginBottom: 12,
  },
  declText: {
    fontSize: 17,
    color: "#f5d49a",
    lineHeight: 28,
    fontWeight: "400",
  },
  meditateCard: {
    backgroundColor: "#2d1800",
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
    alignItems: "center",
  },
  meditateLabel: {
    fontSize: 10,
    color: "#c9923a",
    letterSpacing: 2,
    marginBottom: 16,
  },
  dotRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(201, 146, 58, 0.35)",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  meditateBtn: {
    width: "100%",
    backgroundColor: "#c9923a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  meditateBtnDone: {
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: "#c9923a",
  },
  meditateBtnText: {
    color: "#1a0f00",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  meditateBtnTextDone: { color: "#c9923a" },
  completeMsg: {
    marginTop: 12,
    fontSize: 12,
    color: "#c9923a",
    textAlign: "center",
  },
});