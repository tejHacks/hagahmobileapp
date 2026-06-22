import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Navbar from "../../components/ui/Navbar";
import TopBar from "../../components/ui/TopBar";
import { declarations } from "../../data/declarations";

function getDailyDeclaration() {
  const start = new Date("2025-01-01").getTime();
  const now = new Date().getTime();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return declarations[dayIndex % declarations.length];
}

export default function HomeScreen() {
  const daily = getDailyDeclaration();
  const [copiedScripture, setCopiedScripture] = useState(false);
  const [copiedDeclaration, setCopiedDeclaration] = useState(false);

  const handleCopyScripture = async () => {
    const text = `${daily.ref}\n\n"${daily.scripture}"`;
    await Clipboard.setStringAsync(text);
    setCopiedScripture(true);
    setTimeout(() => setCopiedScripture(false), 2500);
  };

  const handleShareScripture = async () => {
    const text = `✦ HAGAH — Scripture\n\n${daily.ref}\n\n"${daily.scripture}"\n\n— Hagah App`;
    await Share.share({ message: text });
  };

  const handleCopyDeclaration = async () => {
    const text = `${daily.ref}\n\n${daily.declaration}`;
    await Clipboard.setStringAsync(text);
    setCopiedDeclaration(true);
    setTimeout(() => setCopiedDeclaration(false), 2500);
  };

  const handleShareDeclaration = async () => {
    const text = `✦ HAGAH — Today's Declaration\n\n${daily.ref}\n\n${daily.declaration}\n\n— Hagah App`;
    await Share.share({ message: text });
  };

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

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                copiedScripture && styles.actionBtnActive,
              ]}
              onPress={handleCopyScripture}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedScripture ? "checkmark" : "copy-outline"}
                size={14}
                color={copiedScripture ? "#1a0f00" : "#c9923a"}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  copiedScripture && styles.actionBtnTextActive,
                ]}
              >
                {copiedScripture ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShareScripture}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={14} color="#c9923a" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Declaration Card */}
        <View style={styles.declarationCard}>
          <Text style={styles.declLabel}>TODAY'S DECLARATION</Text>
          <Text style={styles.declText}>{daily.declaration}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                copiedDeclaration && styles.actionBtnActive,
              ]}
              onPress={handleCopyDeclaration}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedDeclaration ? "checkmark" : "copy-outline"}
                size={14}
                color={copiedDeclaration ? "#1a0f00" : "#c9923a"}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  copiedDeclaration && styles.actionBtnTextActive,
                ]}
              >
                {copiedDeclaration ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShareDeclaration}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={14} color="#c9923a" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
    gap: 12,
  },
  scriptureRef: {
    fontSize: 11,
    color: "#c9923a",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  scriptureText: {
    fontSize: 15,
    color: "rgba(201, 146, 58, 0.75)",
    fontStyle: "italic",
    lineHeight: 24,
  },

  declarationCard: {
    backgroundColor: "#120900",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.15)",
    gap: 12,
  },
  declLabel: {
    fontSize: 10,
    color: "rgba(201, 146, 58, 0.5)",
    letterSpacing: 2,
  },
  declText: {
    fontSize: 17,
    color: "#f5d49a",
    lineHeight: 28,
    fontWeight: "400",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(201, 146, 58, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  actionBtnActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  actionBtnText: {
    fontSize: 12,
    color: "#c9923a",
    fontWeight: "600",
  },
  actionBtnTextActive: {
    color: "#1a0f00",
  },
});