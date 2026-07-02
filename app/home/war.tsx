import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../../components/ui/Navbar";
import { battleCards, type BattleCard } from "../../data/war_declarations";

const { width } = Dimensions.get("window");
const NAME_KEY = "hagah_warrior_name";

export default function WarScreen() {
  const [phase, setPhase] = useState<"loading" | "welcome" | "name" | "main">("loading");
  const [userName, setUserName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<BattleCard>(battleCards[0]);
  const [battleIndex, setBattleIndex] = useState(0);
  const [speakingTitle, setSpeakingTitle] = useState<string | null>(null);

  const pageFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(1)).current;

  const fadeIn = (val: Animated.Value, duration = 400) =>
    Animated.timing(val, { toValue: 1, duration, useNativeDriver: true });
  const fadeOut = (val: Animated.Value, duration = 220) =>
    Animated.timing(val, { toValue: 0, duration, useNativeDriver: true });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(NAME_KEY);
      if (saved) {
        setUserName(saved);
        setPhase("main");
      } else {
        setPhase("welcome");
      }
    })();
  }, []);

  useEffect(() => {
    if (phase !== "loading") {
      pageFade.setValue(0);
      fadeIn(pageFade, 380).start();
    }
  }, [phase]);

  const goToName = () => {
    fadeOut(pageFade, 240).start(() => setPhase("name"));
  };

  const saveName = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    await AsyncStorage.setItem(NAME_KEY, trimmed);
    setUserName(trimmed);
    fadeOut(pageFade, 240).start(() => setPhase("main"));
  };

  const animateBattleSwitch = (newIndex: number) => {
    const direction = newIndex > battleIndex ? 40 : -40;
    Speech.stop();
    setSpeakingTitle(null);
    Animated.parallel([
      fadeOut(cardFade, 160),
      Animated.timing(cardSlide, { toValue: direction, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setBattleIndex(newIndex);
      setSelected(battleCards[newIndex]);
      cardSlide.setValue(-direction);
      Animated.parallel([
        fadeIn(cardFade, 220),
        Animated.timing(cardSlide, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const goPrev = () => {
    if (battleIndex > 0) animateBattleSwitch(battleIndex - 1);
  };
  const goNext = () => {
    if (battleIndex < battleCards.length - 1) animateBattleSwitch(battleIndex + 1);
  };

  const handleDeclare = () => {
    if (speakingTitle === selected.title) {
      Speech.stop();
      setSpeakingTitle(null);
      return;
    }
    Speech.stop();
    setSpeakingTitle(selected.title);
    const text = `${selected.verse}. ${selected.scripture}. My declaration: ${selected.declaration(userName || "warrior")}`;
    Speech.speak(text, {
      rate: 0.9,
      onDone: () => setSpeakingTitle(null),
      onStopped: () => setSpeakingTitle(null),
      onError: () => setSpeakingTitle(null),
    });
  };

  const isSpeaking = speakingTitle === selected.title;

  if (phase === "loading") return <View style={styles.safe} />;

  // ── WELCOME SCREEN ────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.gatePage, { opacity: pageFade }]}>
          <View style={styles.gateBadgeWrap}>
            <Ionicons name="book" size={30} color="#c9923a" />
          </View>
          <Text style={styles.gateEyebrow}>WAR WITH THE WORD</Text>
          <Text style={styles.gateTitle}>Welcome to{"\n"}the War Room</Text>
          <Text style={styles.gateBody}>
            This is not a quiet devotional. This is a battlefield.{"\n\n"}
            Every struggle you carry — fear, lust, addiction, depression, confusion — has already been answered
            by the Word of God. Here you will find that Word, speak it out loud, and let it do what it was sent to do.{"\n\n"}
            "So shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall accomplish
            that which I please." — Isaiah 55:11
          </Text>
          <View style={styles.tonguesTip}>
            <Ionicons name="flame" size={14} color="#c9923a" style={{ marginRight: 6 }} />
            <Text style={styles.tonguesTipText}>
              Pray in tongues. Pray in your understanding. Speak God's Word. Fight until the atmosphere shifts.
            </Text>
          </View>
          <TouchableOpacity style={styles.gateBtn} onPress={goToName} activeOpacity={0.85}>
            <Ionicons name="arrow-forward" size={15} color="#1a0f00" style={{ marginRight: 8 }} />
            <Text style={styles.gateBtnText}>Enter the war room</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── NAME SCREEN ───────────────────────────────────────────────────────────
  if (phase === "name") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.gatePage}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View style={[{ width: "100%" }, { opacity: pageFade }]}>
            <View style={styles.gateBadgeWrap}>
              <Ionicons name="person" size={26} color="#c9923a" />
            </View>
            <Text style={styles.gateEyebrow}>ONE MORE THING</Text>
            <Text style={styles.gateTitle}>Who is going{"\n"}to war?</Text>
            <Text style={styles.gateBody}>
              Your name will be woven into every declaration — because these words are not generic. They are yours.
            </Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name..."
              placeholderTextColor="rgba(201,146,58,0.38)"
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={saveName}
              autoFocus
            />
            <TouchableOpacity style={styles.gateBtn} onPress={saveName} activeOpacity={0.85}>
              <Ionicons name="flash" size={14} color="#1a0f00" style={{ marginRight: 8 }} />
              <Text style={styles.gateBtnText}>I'm ready to fight</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── MAIN SCREEN ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <Animated.View style={[{ flex: 1 }, { opacity: pageFade }]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eyebrow}>WAR WITH THE WORD</Text>
            <Text style={styles.title}>Fight with Faith</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="book" size={20} color="#c9923a" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Name tag */}
          <View style={styles.nameTagRow}>
            <Ionicons name="person-circle" size={15} color="#c9923a" />
            <Text style={styles.nameTag}>
              Fighting as <Text style={styles.nameTagBold}>{userName}</Text>
            </Text>
            <TouchableOpacity
              hitSlop={12}
              onPress={() => {
                setInputValue(userName);
                fadeOut(pageFade, 200).start(() => setPhase("name"));
              }}
            >
              <Text style={styles.nameChange}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>THIS IS NOT A QUIET PLACE</Text>
            <Text style={styles.heroTitle}>Some battles are only won out loud</Text>
            <Text style={styles.heroBody}>
              Whatever has been silently choking you was never stronger than the Word that made you.
              Stop absorbing the attack — start firing back.
            </Text>
            <View style={styles.heroHintRow}>
              <Ionicons name="sparkles" size={14} color="#f5d49a" />
              <Text style={styles.heroHint}>
                Pray in tongues. Pray in your understanding. Declare the Word. Stand until it breaks.
              </Text>
            </View>
          </View>

          {/* Section label */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>CHOOSE YOUR BATTLE</Text>
            <Text style={styles.sectionSub}>
              {battleIndex + 1} of {battleCards.length} · swipe or use the arrows
            </Text>
          </View>

          {/* Battle slider */}
          <Animated.View
            style={[
              styles.battleCard,
              { opacity: cardFade, transform: [{ translateX: cardSlide }] },
            ]}
          >
            {/* Icon + title */}
            <View style={styles.battleIconWrap}>
              <View style={[styles.battleIconCircle, isSpeaking && styles.battleIconCircleActive]}>
                <Ionicons
                  name={selected.icon as any}
                  size={40}
                  color={isSpeaking ? "#1a0f00" : "#c9923a"}
                />
              </View>
            </View>
            <Text style={styles.battleTitle}>{selected.title}</Text>
            <Text style={styles.battleVerse}>{selected.verse}</Text>

            <View style={styles.battleDivider} />

            <Text style={styles.battleScriptureLabel}>SCRIPTURE (KJV)</Text>
            <Text style={styles.battleScripture}>"{selected.scripture}"</Text>

            <View style={styles.battleDivider} />

            <Text style={styles.battleDeclLabel}>YOUR DECLARATION</Text>
            <Text style={styles.battleDecl}>{selected.declaration(userName)}</Text>

            {/* Declare button */}
            <TouchableOpacity
              style={[styles.declareBtn, isSpeaking && styles.declareBtnActive]}
              onPress={handleDeclare}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isSpeaking ? "stop" : "mic"}
                size={16}
                color={isSpeaking ? "#1a0f00" : "#f5d49a"}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.declareBtnText, isSpeaking && styles.declareBtnTextActive]}>
                {isSpeaking ? "Stop speaking" : "Declare this now"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Prev / Next — no dots */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, battleIndex === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={battleIndex === 0}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={16} color={battleIndex === 0 ? "#3a2510" : "#c9923a"} />
              <Text style={[styles.navBtnText, battleIndex === 0 && styles.navBtnTextDisabled]}>Previous</Text>
            </TouchableOpacity>

            <Text style={styles.navCount}>{battleIndex + 1} / {battleCards.length}</Text>

            <TouchableOpacity
              style={[styles.navBtn, battleIndex === battleCards.length - 1 && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={battleIndex === battleCards.length - 1}
              activeOpacity={0.75}
            >
              <Text style={[styles.navBtnText, battleIndex === battleCards.length - 1 && styles.navBtnTextDisabled]}>Next</Text>
              <Ionicons name="chevron-forward" size={16} color={battleIndex === battleCards.length - 1 ? "#3a2510" : "#c9923a"} />
            </TouchableOpacity>
          </View>

          {/* Pray till it stops */}
          <View style={styles.prayTipRow}>
            <Ionicons name="mic" size={13} color="#c9923a" style={{ marginRight: 6 }} />
            <Text style={styles.prayTipText}>
              Tap "Declare this now" and pray until the Spirit stops — don't rush it.
            </Text>
          </View>

          {/* Tongues card */}
          <View style={styles.tonguesCard}>
            <View style={styles.tonguesCardRow}>
              <Ionicons name="flame" size={15} color="#c9923a" style={{ marginRight: 8 }} />
              <Text style={styles.tonguesCardTitle}>Pray in the Spirit</Text>
            </View>
            <Text style={styles.tonguesCardText}>
              Before or after you declare — pray in tongues. Pray in your understanding.
              Let the Holy Spirit intercede through you. You are not fighting alone: the Spirit of God
              fights with you and through you. Speak until the atmosphere shifts.
            </Text>
            <Text style={styles.tonguesCardRef}>Romans 8:26 · Jude 1:20 · 1 Corinthians 14:4</Text>
          </View>

          {/* War prayer */}
          <View style={styles.warPrayerCard}>
            <Text style={styles.warPrayerTitle}>Prayer of war</Text>
            <Text style={styles.warPrayerText}>
              Father, I stand on Your Word. I will not be ruled by fear, lust, doubt, depression, or any
              stronghold of the enemy. Let Your light break every darkness around me. Let Your peace reign.
              Let Your will be done in my life, and let every lie be silenced by the truth of Jesus. Amen.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f00" },

  // ── Gate pages (welcome + name)
  gatePage: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  gateBadgeWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(201,146,58,0.14)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 22,
  },
  gateEyebrow: {
    color: "#c9923a", fontSize: 11, fontWeight: "700",
    letterSpacing: 2.8, marginBottom: 12,
  },
  gateTitle: {
    color: "#f5d49a", fontSize: 36, fontWeight: "800",
    lineHeight: 42, marginBottom: 18,
  },
  gateBody: {
    color: "#b89a6a", fontSize: 14, lineHeight: 23, marginBottom: 22,
  },
  tonguesTip: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "rgba(201,146,58,0.08)",
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "rgba(201,146,58,0.18)",
    marginBottom: 28,
  },
  tonguesTipText: { color: "#b89a6a", fontSize: 13, lineHeight: 20, flex: 1 },
  gateBtn: {
    backgroundColor: "#c9923a", borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  gateBtnText: { color: "#1a0f00", fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },
  nameInput: {
    backgroundColor: "rgba(201,146,58,0.07)",
    borderWidth: 1, borderColor: "rgba(201,146,58,0.28)",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: "#f5d49a", fontSize: 16, marginBottom: 14,
  },

  // ── Main header
  header: {
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: { gap: 2 },
  eyebrow: { color: "#c9923a", fontSize: 11, fontWeight: "700", letterSpacing: 2.6 },
  title: { color: "#f5d49a", fontSize: 24, fontWeight: "800" },
  headerBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(201,146,58,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,146,58,0.2)",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // name tag
  nameTagRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 12,
  },
  nameTag: { color: "#6b4e28", fontSize: 12, flex: 1 },
  nameTagBold: { color: "#c9923a", fontWeight: "700" },
  nameChange: { color: "#c9923a", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },

  // Hero
  heroCard: {
    backgroundColor: "#1e1100", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(201,146,58,0.18)", marginBottom: 16,
  },
  heroEyebrow: { color: "#c9923a", fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 7 },
  heroTitle: { color: "#f5d49a", fontSize: 19, fontWeight: "800", lineHeight: 26, marginBottom: 8 },
  heroBody: { color: "#a07a4a", lineHeight: 21, fontSize: 13, marginBottom: 10 },
  heroHintRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  heroHint: { color: "#7a5c32", fontSize: 12, flex: 1, lineHeight: 18 },

  // Section
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  sectionLabel: { color: "#c9923a", fontSize: 11, fontWeight: "700", letterSpacing: 1.6 },
  sectionSub: { color: "#5a3e1b", fontSize: 11 },

  // Battle card (the big slider card)
  battleCard: {
    backgroundColor: "#1e1100",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(201,146,58,0.28)",
    marginBottom: 14,
    minHeight: 380,
  },
  battleIconWrap: { alignItems: "center", marginBottom: 12 },
  battleIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(201,146,58,0.1)",
    borderWidth: 1.5, borderColor: "rgba(201,146,58,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  battleIconCircleActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  battleTitle: {
    color: "#f5d49a", fontSize: 26, fontWeight: "800",
    textAlign: "center", marginBottom: 4,
  },
  battleVerse: {
    color: "#c9923a", fontSize: 12, fontWeight: "600",
    textAlign: "center", letterSpacing: 1, marginBottom: 14,
  },
  battleDivider: {
    height: 1, backgroundColor: "rgba(201,146,58,0.12)", marginBottom: 14,
  },
  battleScriptureLabel: {
    color: "rgba(201,146,58,0.45)", fontSize: 9, fontWeight: "700",
    letterSpacing: 2, marginBottom: 7,
  },
  battleScripture: {
    color: "#d4a85c", fontSize: 14, fontStyle: "italic",
    lineHeight: 22, marginBottom: 14,
  },
  battleDeclLabel: {
    color: "rgba(201,146,58,0.45)", fontSize: 9, fontWeight: "700",
    letterSpacing: 2, marginBottom: 7,
  },
  battleDecl: {
    color: "#e5cda0", fontSize: 15, lineHeight: 24, fontWeight: "500", marginBottom: 20,
  },
  declareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,146,58,0.14)",
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(201,146,58,0.25)",
  },
  declareBtnActive: { backgroundColor: "#c9923a", borderColor: "#c9923a" },
  declareBtnText: { color: "#f5d49a", fontSize: 14, fontWeight: "800", letterSpacing: 0.6 },
  declareBtnTextActive: { color: "#1a0f00" },

  // Nav row
  navRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 18,
  },
  navBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: "rgba(201,146,58,0.08)",
    borderWidth: 1, borderColor: "rgba(201,146,58,0.2)",
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: "#c9923a", fontSize: 13, fontWeight: "700" },
  navBtnTextDisabled: { color: "#3a2510" },

  navCount: { color: "#5a3e1b", fontSize: 12, fontWeight: "600" },
  prayTipRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 4, marginBottom: 16,
  },
  prayTipText: { color: "#5a3e1b", fontSize: 12, lineHeight: 18, flex: 1, fontStyle: "italic" },

  // Tongues
  tonguesCard: {
    backgroundColor: "#120900", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(201,146,58,0.18)", marginBottom: 12,
  },
  tonguesCardRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  tonguesCardTitle: { color: "#f5d49a", fontSize: 14, fontWeight: "700" },
  tonguesCardText: { color: "#7a5c32", lineHeight: 21, fontSize: 13, marginBottom: 8 },
  tonguesCardRef: { color: "rgba(201,146,58,0.4)", fontSize: 10, letterSpacing: 1 },

  // War prayer
  warPrayerCard: {
    backgroundColor: "#120900", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(201,146,58,0.18)",
  },
  warPrayerTitle: { color: "#f5d49a", fontSize: 15, fontWeight: "700", marginBottom: 8 },
  warPrayerText: { color: "#7a5c32", lineHeight: 22, fontSize: 13 },
});