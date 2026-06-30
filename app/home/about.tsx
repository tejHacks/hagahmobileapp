import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Import vector icons
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "../../components/ui/Navbar";
import TopBar from "../../components/ui/TopBar";

const { width } = Dimensions.get("window");

type Section = {
  iconType: "hebrew" | "vector";
  iconFamily?: "Ionicons" | "MaterialCommunityIcons";
  iconName?: string;
  title: string;
  body: string;
};

const sections: Section[] = [
  {
    // Keeping Hebrew text layout since it's the theme, but handled separately below
    iconType: "hebrew",
    title: "What is Hagah?",
    body: "Hagah (הגה) is the Hebrew word for meditate — but it means far more than quiet reflection. It means to murmur, to mutter, to declare aloud. It is the sound a lion makes over its prey. It is intentional, vocal, repeated confession of God's Word.",
  },
  {
    iconType: "vector",
    iconFamily: "Ionicons",
    iconName: "color-wand-outline",
    title: "How it works",
    body: "Each day, you receive one scripture-backed declaration. Read it. Speak it aloud. Tap through all 5 meditation circles. Let the Word of God saturate your spirit before you face the day.",
  },
  {
    iconType: "vector",
    iconFamily: "Ionicons",
    iconName: "flame-outline",
    title: "Why declarations?",
    body: "Proverbs 18:21 says death and life are in the power of the tongue. Romans 10:10 says with the mouth, confession is made unto salvation. What you speak consistently, you begin to believe. What you believe, you walk in.",
  },
  {
    iconType: "vector",
    iconFamily: "MaterialCommunityIcons",
    iconName: "book-open-variant",
    title: "The scriptures",
    body: "Every declaration in Hagah is rooted in scripture. We don't make things up — every word is anchored in the Bible. You will find references from Genesis to Revelation, covering dominion, healing, prosperity, purpose, and more.",
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroHebrew}>הגה</Text>
          <Text style={styles.heroName}>HAGAH</Text>
          <Text style={styles.heroTagline}>Speak the Word. Shape your world.</Text>
        </View>

        {/* Sections */}
        {sections.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.iconContainer}>
              {s.iconType === "hebrew" ? (
                <Text style={styles.cardHebrewIcon}>הגה</Text>
              ) : s.iconFamily === "Ionicons" ? (
                <Ionicons name={s.iconName as React.ComponentProps<typeof Ionicons>["name"]} size={22} color="#c9923a" />
              ) : (
                <MaterialCommunityIcons name={s.iconName as React.ComponentProps<typeof MaterialCommunityIcons>["name"]} size={22} color="#c9923a" />
              )}
            </View>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        {/* Footer with updated full KJV scripture */}
        <View style={styles.footer}>
          <Text style={styles.footerVerse}>
            "This book of the law shall not depart out of thy mouth;{"\n"}
            but thou shalt <Text style={styles.footerBold}>hagah</Text> therein day and night,{"\n"}
            that thou mayest observe to do according to all that is written therein:{"\n"}
            for then thou shalt make thy way prosperous, and then thou shalt have good success."
          </Text>
          <Text style={styles.footerRef}>Joshua 1:8</Text>
          <Text style={styles.footerCredit}>Built with faith. Made for purpose.</Text>
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
  hero: {
    alignItems: "center",
    paddingVertical: 28,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(201, 146, 58, 0.15)",
    marginBottom: 4,
  },
  heroHebrew: {
    fontSize: 52,
    color: "#c9923a",
    fontWeight: "300",
    letterSpacing: 4,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f5d49a",
    letterSpacing: 8,
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 13,
    color: "#5a3e1b",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#2d1800",
    borderRadius: 12,
    padding: 18,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.15)",
    gap: 8,
  },
  iconContainer: {
    height: 24,
    justifyContent: "center",
  },
  cardHebrewIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#c9923a",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f5d49a",
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: 14,
    color: "rgba(245, 212, 154, 0.65)",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  footerVerse: {
    fontSize: 12,
    color: "rgba(201, 146, 58, 0.5)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
  footerBold: {
    color: "#c9923a",
    fontWeight: "700",
  },
  footerRef: {
    fontSize: 11,
    color: "#c9923a",
    opacity: 0.6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footerCredit: {
    fontSize: 11,
    color: "#5a3e1b",
    letterSpacing: 1,
    marginTop: 4,
  },
});
