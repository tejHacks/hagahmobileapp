


import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import { Theme, useTheme } from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import { bibleBooks } from "../../data/bible";
import { booksByIssue } from "../../data/books_war_recommended";
import { battleCards, type BattleCard } from "../../data/war_declarations";
import { getDb } from "../../utils/database";

const NAME_KEY = "hagah_warrior_name";

// ── pure helpers — defined outside component so useEffect deps stay clean ──
const fadeIn = (val: Animated.Value, duration = 400) =>
  Animated.timing(val, { toValue: 1, duration, useNativeDriver: true });

const fadeOut = (val: Animated.Value, duration = 220) =>
  Animated.timing(val, { toValue: 0, duration, useNativeDriver: true });

export default function WarScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [phase, setPhase] = useState<"loading" | "welcome" | "name" | "main">("loading");
  const [userName, setUserName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<BattleCard>(battleCards[0]);
  const [battleIndex, setBattleIndex] = useState(0);
  const [speakingTitle, setSpeakingTitle] = useState<string | null>(null);
  const prayerPrompts = [
    "Pray until your heart becomes still before God.",
    "Pray in the Spirit. Pray with understanding. Bring this battle before God.",
    "Do not rush this moment. Stay with God.",
    "Let Scripture shape your prayer, not your fear.",
    "Ask the Holy Spirit to expose what you cannot see for yourself.",
  ];
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * prayerPrompts.length));
  const [resolvedScriptures, setResolvedScriptures] = useState<Record<string, string | null>>({});
  const resolvedCacheRef = useRef<Record<string, string | null>>({});

  const parseReference = React.useCallback((ref: string) => {
    const r = ref.trim();
    const lower = r.toLowerCase();
    // Try matching by book name, id, or common variants (singular/plural/abbrev)
    let bookMatch = null as (typeof bibleBooks)[0] | null;
    for (const b of bibleBooks) {
      const name = b.name.toLowerCase();
      const id = b.id.toLowerCase();
      const variants = new Set<string>([
        name,
        id,
        name.replace(/\s+/g, ""),
        name.replace(/s$/, ""),
      ]);
      for (const v of variants) {
        if (v && lower.startsWith(v)) {
          bookMatch = b;
          break;
        }
      }
      if (bookMatch) break;
    }
    if (!bookMatch) return null;
    // remove the matched book name from the start (best-effort)
    let rest = r.slice(bookMatch.name.length).trim();
    if (!rest) rest = r.slice(bookMatch.id.length).trim();
    const first = rest.split(" ")[0] || rest;
    const [chapStr, verseStr] = first.split(":");
    const chapter = parseInt(chapStr, 10);
    if (isNaN(chapter)) return null;
    let startVerse = 1;
    let endVerse = 1;
    if (verseStr) {
      const parts = verseStr.split(/[-–—]/).map((s) => s.replace(/[^0-9]/g, "")).filter(Boolean);
      startVerse = parseInt(parts[0], 10) || 1;
      endVerse = parts[1] ? parseInt(parts[1], 10) || startVerse : startVerse;
    }
    return { bookId: bookMatch.id, chapter, startVerse, endVerse };
  }, []);

  const resolveReferenceText = React.useCallback(async (reference: string) => {
    if (Object.prototype.hasOwnProperty.call(resolvedCacheRef.current, reference)) {
      return resolvedCacheRef.current[reference];
    }
    const parsed = parseReference(reference);
    if (!parsed) return null;
    try {
      // Query only the needed verses (faster for large chapters like Psalms)
      const db = await getDb();
      const rows = await db.getAllAsync<{ verse: number; words_json: string }>(
        `SELECT verse, words_json FROM verses WHERE book = ? AND chapter = ? AND verse BETWEEN ? AND ? ORDER BY verse ASC`,
        [parsed.bookId, parsed.chapter, parsed.startVerse, parsed.endVerse]
      );
      const texts: string[] = [];
      for (const row of rows) {
        try {
          const words = JSON.parse(row.words_json) as { t: string }[];
          texts.push(words.map((w) => w.t).join(" "));
        } catch {
          // ignore malformed row
        }
      }
      const joined = texts.join(" ");
      resolvedCacheRef.current[reference] = joined || null;
      return joined || null;
    } catch (e) {
      console.warn("Resolve reference failed", reference, e);
      resolvedCacheRef.current[reference] = null;
      return null;
    }
  }, [parseReference]);

  const pageFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(1)).current;

  // ── load saved name ──────────────────────────────────────────────────────
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

  // ── fade in whenever phase changes ───────────────────────────────────────
  useEffect(() => {
    if (phase === "loading") return;
    pageFade.setValue(0);
    fadeIn(pageFade, 380).start();
  }, [phase, pageFade]);

  // ── navigation helpers ───────────────────────────────────────────────────
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

  // ── battle card animation ────────────────────────────────────────────────
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
      // pick a new random prayer prompt when battle changes
      setPromptIndex(Math.floor(Math.random() * prayerPrompts.length));
      cardSlide.setValue(-direction);
      Animated.parallel([
        fadeIn(cardFade, 220),
        Animated.timing(cardSlide, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const goPrev = () => { if (battleIndex > 0) animateBattleSwitch(battleIndex - 1); };
  const goNext = () => { if (battleIndex < battleCards.length - 1) animateBattleSwitch(battleIndex + 1); };

  // ── TTS declare ──────────────────────────────────────────────────────────
  const handleDeclare = () => {
    if (speakingTitle === selected.title) {
      Speech.stop();
      setSpeakingTitle(null);
      return;
    }
    Speech.stop();
    setSpeakingTitle(selected.title);
    const base = selected.declaration(userName || "warrior");
    const strong = `In the name of Jesus, I, ${userName || "warrior"}, decree and declare: ${base} I break every assignment of the enemy, and I take hold of the promises of God for my life. By the blood of Jesus and the power of the Holy Spirit, I stand firm and walk free.`;
    const text = `${selected.verse}. ${selected.scripture}. ${strong}`;
    Speech.speak(text, {
      rate: 0.9,
      onDone: () => setSpeakingTitle(null),
      onStopped: () => setSpeakingTitle(null),
      onError: () => setSpeakingTitle(null),
    });
  };

  const isSpeaking = speakingTitle === selected.title;

  // Resolve scripture texts (up to 3) from local DB when the battle changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      setResolvedScriptures({});
      if (!selected?.scriptures) return;
      const list = selected.scriptures.slice(0, 3);
      for (const sc of list) {
        if (!mounted) return;
        if (sc.text) {
          setResolvedScriptures((s) => ({ ...s, [sc.reference]: sc.text ?? null }));
          resolvedCacheRef.current[sc.reference] = sc.text ?? null;
        } else {
          const txt = await resolveReferenceText(sc.reference);
          if (!mounted) return;
          setResolvedScriptures((s) => ({ ...s, [sc.reference]: txt ?? null }));
        }
      }
    })();
    return () => { mounted = false; };
  }, [battleIndex, selected, resolveReferenceText]);

  if (phase === "loading") return <View style={styles.safe} />;

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.gatePage, { opacity: pageFade }]}>
          <View style={styles.gateBadgeWrap}>
            <Ionicons name="book" size={30} color={theme.colors.accent} />
          </View>
          <Text style={styles.gateEyebrow}>WAR WITH THE WORD</Text>
          <Text style={styles.gateTitle}>Welcome to{"\n"}the War Room</Text>
          <Text style={styles.gateBody}>
            This is not a quiet devotional. This is a battlefield.{"\n\n"}
            Every struggle you carry — fear, lust, addiction, depression, confusion — has already been answered
            by the Word of God. Here you will find that Word, speak it out loud, and let it do what it was sent to do.{"\n\n"}
            &quot;So shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall
            accomplish that which I please.&quot; — Isaiah 55:11
          </Text>
          <View style={styles.tonguesTip}>
            <Ionicons name="flame" size={14} color={theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.tonguesTipText}>
              Pray in tongues. Pray in your understanding. Speak God&apos;s Word. Fight until the atmosphere shifts.
            </Text>
          </View>
          <TouchableOpacity style={styles.gateBtn} onPress={goToName} activeOpacity={0.85}>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.onAccent} style={{ marginRight: 8 }} />
            <Text style={styles.gateBtnText}>Enter the war room</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── NAME ─────────────────────────────────────────────────────────────────
  if (phase === "name") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.gatePage}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
        >
          <Animated.View style={[{ width: "100%" }, { opacity: pageFade }]}>
            <View style={styles.gateBadgeWrap}>
              <Ionicons name="person" size={26} color={theme.colors.accent} />
            </View>
            <Text style={styles.gateEyebrow}>ONE MORE THING</Text>
            <Text style={styles.gateTitle}>Who is going{"\n"}to war?</Text>
            <Text style={styles.gateBody}>
              Your name will be woven into every declaration — because these words are not generic. They are yours.
            </Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name..."
              placeholderTextColor={theme.colors.textFaint}
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={saveName}
              autoFocus
            />
            <TouchableOpacity style={styles.gateBtn} onPress={saveName} activeOpacity={0.85}>
              <Ionicons name="flash" size={14} color={theme.colors.onAccent} style={{ marginRight: 8 }} />
              <Text style={styles.gateBtnText}>I&apos;m ready to fight</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── MAIN ─────────────────────────────────────────────────────────────────
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
            <Ionicons name="book" size={20} color={theme.colors.accent} />
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Name tag */}
          <View style={styles.nameTagRow}>
            <Ionicons name="person-circle" size={15} color={theme.colors.accent} />
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
              <Ionicons name="sparkles" size={14} color={theme.colors.textPrimary} />
              <Text style={styles.heroHint}>
                Pray in tongues. Pray in your understanding. Declare the Word. Stand until it breaks.
              </Text>
            </View>
          </View>

          {/* Section label */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>CHOOSE YOUR BATTLE</Text>
            <Text style={styles.sectionSub}>
              {battleIndex + 1} of {battleCards.length} · use the arrows
            </Text>
          </View>

          {/* Battle content structured into multiple sections */}
          <Animated.View style={{ opacity: cardFade, transform: [{ translateX: cardSlide }] }}>

            {/* Intro */}
            <View style={styles.sectionSurface}>
              <View style={styles.battleHeaderRow}>
                <View style={[styles.battleIconCircleSmall, isSpeaking && styles.battleIconCircleActive]}>
                  <Ionicons name={selected.icon as any} size={28} color={isSpeaking ? theme.colors.onAccent : theme.colors.accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.battleTitle}>{selected.title}</Text>
                  <Text style={styles.battleVerseSmall}>{selected.verse}</Text>
                </View>
                <View style={{ width: 72, alignItems: 'flex-end' }}>
                  <Text style={styles.navCount}>BATTLE {String(battleIndex + 1).padStart(2, '0')} / {battleCards.length}</Text>
                </View>
              </View>

              {selected.description ? <Text style={styles.battleIntro}>{selected.description}</Text> : null}
            </View>

            {/* How to fight */}
            {selected.howToFight && selected.howToFight.length > 0 && (
              <View style={styles.sectionSurface}>
                <Text style={styles.sectionHeading}>HOW TO FIGHT</Text>
                {selected.howToFight.map((s, i) => (
                  <View key={i} style={styles.howRow}>
                    <View style={styles.howIndex}><Text style={styles.howIndexText}>{String(i + 1).padStart(2, '0')}</Text></View>
                    <Text style={styles.howText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Scriptures to fight with (limit 3) */}
            <View style={styles.sectionSurface}>
              <Text style={styles.sectionHeading}>SCRIPTURES TO FIGHT WITH</Text>
              <Text style={styles.battleScripture}>&quot;{selected.scripture}&quot;</Text>
              {selected.scriptures && selected.scriptures.slice(0, 3).map((sc, idx) => (
                <View key={sc.reference + idx} style={styles.scriptureRow}>
                  <Text style={styles.scriptureIndex}>{String(idx + 1).padStart(2, '0')}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scriptureRef}>{sc.reference}</Text>
                    {/* If text is available include it, otherwise the app may later resolve from DB */}
                    {sc.text ? (
                      <Text style={styles.scriptureText}>&quot;{sc.text}&quot;</Text>
                    ) : (
                      resolvedScriptures[sc.reference] ? (
                        <Text style={styles.scriptureText}>&quot;{resolvedScriptures[sc.reference]}&quot;</Text>
                      ) : (
                        <Text style={[styles.scriptureText, { color: theme.colors.textDisabled }]}>Loading…</Text>
                      )
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Declare */}
            <View style={styles.sectionSurface}>
              <Text style={styles.sectionHeading}>DECLARE THIS</Text>
              <Text style={styles.battleDecl}>{`In the name of Jesus, I, ${userName || "warrior"}, decree and declare: ${selected.declaration(userName)}`}</Text>

              <TouchableOpacity
                style={[styles.declareBtn, isSpeaking && styles.declareBtnActive, { marginTop: 12 }]}
                onPress={handleDeclare}
                activeOpacity={0.85}
              >
                <Ionicons name={isSpeaking ? "stop" : "mic"} size={16} color={isSpeaking ? theme.colors.onAccent : theme.colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={[styles.declareBtnText, isSpeaking && styles.declareBtnTextActive]}>
                  {isSpeaking ? "STOP DECLARATION" : "DECLARE THIS NOW"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pray */}
            {selected.prayer && (
              <View style={styles.sectionSurface}>
                <Text style={styles.sectionHeading}>PRAY THROUGH IT</Text>
                <Text style={styles.warPrayerText}>{selected.prayer}</Text>
              </View>
            )}

            {/* Fast & Seek God */}
            {selected.fasting && (
              <View style={styles.sectionSurface}>
                <Text style={styles.sectionHeading}>FAST & SEEK GOD</Text>
                <Text style={styles.warPrayerText}>{selected.fasting}</Text>
              </View>
            )}

            {/* Heart check */}
            {selected.repentance && (
              <View style={styles.sectionSurface}>
                <Text style={styles.sectionHeading}>HEART CHECK</Text>
                <Text style={styles.warPrayerText}>{selected.repentance}</Text>
              </View>
            )}

            {/* Prayer prompt (random) — sits before recommended reading */}
            <View style={styles.sectionSurface}>
              <Text style={styles.sectionHeading}>PRAYER TIP</Text>
              <Text style={styles.warPrayerText}>{prayerPrompts[promptIndex]}</Text>
            </View>

            {/* Recommended reading */}
            <View style={styles.sectionSurface}>
              <Text style={styles.sectionHeading}>RECOMMENDED READING</Text>
              {booksByIssue[selected.recommendedReadingKey || selected.title] ? (
                booksByIssue[selected.recommendedReadingKey || selected.title].slice(0, 3).map((b, i) => (
                  <View key={b} style={styles.bookRow}>
                    <Text style={styles.bookTitle}>{b}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.warPrayerText}>No recommended books for this battle.</Text>
              )}
            </View>

          </Animated.View>

          {/* Prev / Next */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, battleIndex === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={battleIndex === 0}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={16} color={battleIndex === 0 ? theme.colors.textDisabled : theme.colors.accent} />
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
              <Ionicons name="chevron-forward" size={16} color={battleIndex === battleCards.length - 1 ? theme.colors.textDisabled : theme.colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Pray tip */}
          <View style={styles.prayTipRow}>
            <Ionicons name="mic" size={13} color={theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.prayTipText}>
              Tap &quot;Declare this now&quot; and pray — don&apos;t rush it.
            </Text>
          </View>

          {/* Tongues card */}
          <View style={styles.tonguesCard}>
            <View style={styles.tonguesCardRow}>
              <Ionicons name="flame" size={15} color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.tonguesCardTitle}>Pray in the Spirit</Text>
            </View>
            <Text style={styles.tonguesCardText}>
              Before or after you declare — pray in tongues. Pray in your understanding.
              Let the Holy Spirit intercede through you. You are not fighting alone: the Spirit of God
              fights with you and through you. Speak until the atmosphere shifts.
            </Text>
            <Text style={styles.tonguesCardRef}>Romans 8:26 · Jude 1:20 · 1 Corinthians 14:4</Text>
          </View>




          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      <Navbar />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgBase },

    gatePage: { flex: 1, paddingHorizontal: 28, justifyContent: "center" },
    gateBadgeWrap: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: c.tint,
      alignItems: "center", justifyContent: "center", marginBottom: 22,
    },
    gateEyebrow: { color: c.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2.8, marginBottom: 12 },
    gateTitle: { color: c.textPrimary, fontSize: 36, fontWeight: "800", lineHeight: 42, marginBottom: 18 },
    gateBody: { color: c.textMuted, fontSize: 14, lineHeight: 23, marginBottom: 22 },
    tonguesTip: {
      flexDirection: "row", alignItems: "flex-start",
      backgroundColor: c.tint,
      borderRadius: 12, padding: 12,
      borderWidth: 1, borderColor: c.border, marginBottom: 28,
    },
    tonguesTipText: { color: c.textMuted, fontSize: 13, lineHeight: 20, flex: 1 },
    gateBtn: {
      backgroundColor: c.accent, borderRadius: 14, paddingVertical: 15,
      flexDirection: "row", alignItems: "center", justifyContent: "center",
    },
    gateBtnText: { color: c.onAccent, fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },
    nameInput: {
      backgroundColor: c.tint,
      borderWidth: 1, borderColor: c.borderStrong,
      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
      color: c.textPrimary, fontSize: 16, marginBottom: 14,
    },

    header: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    headerLeft: { gap: 2 },
    eyebrow: { color: c.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2.6 },
    title: { color: c.textPrimary, fontSize: 24, fontWeight: "800" },
    headerBadge: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: c.tint,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: c.border,
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

    nameTagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    nameTag: { color: c.textFaint, fontSize: 12, flex: 1 },
    nameTagBold: { color: c.accent, fontWeight: "700" },
    nameChange: { color: c.accent, fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },

    heroCard: {
      backgroundColor: c.bgSurface, borderRadius: 20, padding: 16,
      borderWidth: 1, borderColor: c.border, marginBottom: 16,
    },
    heroEyebrow: { color: c.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 7 },
    heroTitle: { color: c.textPrimary, fontSize: 19, fontWeight: "800", lineHeight: 26, marginBottom: 8 },
    heroBody: { color: c.textMuted, lineHeight: 21, fontSize: 13, marginBottom: 10 },
    heroHintRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
    heroHint: { color: c.textFaint, fontSize: 12, flex: 1, lineHeight: 18 },

    sectionHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
    },
    sectionLabel: { color: c.accent, fontSize: 11, fontWeight: "700", letterSpacing: 1.6 },
    sectionSub: { color: c.textFaint, fontSize: 11 },


    battleIconCircleActive: { backgroundColor: c.tintActive, borderColor: c.tintActive },
    battleTitle: { color: c.textPrimary, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 4 },
    battleVerse: { color: c.accent, fontSize: 12, fontWeight: "600", textAlign: "center", letterSpacing: 1, marginBottom: 14 },
    battleDivider: { height: 1, backgroundColor: c.borderSubtle, marginBottom: 14 },
    battleScriptureLabel: { color: c.textFaint, fontSize: 9, fontWeight: "700", letterSpacing: 2, marginBottom: 7 },
    battleScripture: { color: c.textSecondary, fontSize: 14, fontStyle: "italic", lineHeight: 22, marginBottom: 14 },
    battleDeclLabel: { color: c.textFaint, fontSize: 9, fontWeight: "700", letterSpacing: 2, marginBottom: 7 },
    battleDecl: { color: c.textPrimary, fontSize: 15, lineHeight: 24, fontWeight: "500", marginBottom: 20 },

    declareBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      backgroundColor: c.tint, paddingVertical: 14, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
    },
    declareBtnActive: { backgroundColor: c.tintActive, borderColor: c.tintActive },
    declareBtnText: { color: c.textPrimary, fontSize: 14, fontWeight: "800", letterSpacing: 0.6 },
    declareBtnTextActive: { color: c.onAccent },

    navRow: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", marginBottom: 18,
    },
    navBtn: {
      flexDirection: "row", alignItems: "center", gap: 4,
      paddingHorizontal: 14, paddingVertical: 10,
      borderRadius: 10, backgroundColor: c.tint,
      borderWidth: 1, borderColor: c.border,
    },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { color: c.accent, fontSize: 13, fontWeight: "700" },
    navBtnTextDisabled: { color: c.textDisabled },
    navCount: { color: c.textFaint, fontSize: 12, fontWeight: "600" },

    prayTipRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4, marginBottom: 16 },
    prayTipText: { color: c.textFaint, fontSize: 12, lineHeight: 18, flex: 1, fontStyle: "italic" },

    tonguesCard: {
      backgroundColor: c.bgSunken, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: c.border, marginBottom: 12,
    },
    tonguesCardRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    tonguesCardTitle: { color: c.textPrimary, fontSize: 14, fontWeight: "700" },
    tonguesCardText: { color: c.textFaint, lineHeight: 21, fontSize: 13, marginBottom: 8 },
    tonguesCardRef: { color: c.textFaint, fontSize: 10, letterSpacing: 1 },

    // New war sections
    sectionSurface: {
      backgroundColor: c.bgSurface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 12,
    },
    battleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    battleIconCircleSmall: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.borderStrong,
    },
    battleVerseSmall: { color: c.accent, fontSize: 12, fontWeight: '600' },
    battleIntro: { color: c.textMuted, fontSize: 13, lineHeight: 20, marginTop: 6 },
    sectionHeading: { color: c.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 8 },
    howRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    howIndex: { width: 36, height: 36, borderRadius: 8, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    howIndexText: { color: c.onAccent, fontWeight: '800' },
    howText: { color: c.textPrimary, flex: 1 },
    scriptureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    scriptureIndex: { width: 28, color: c.accent, fontWeight: '800', marginRight: 8 },
    scriptureRef: { color: c.textFaint, fontSize: 12, marginBottom: 4 },
    scriptureText: { color: c.textSecondary, fontStyle: 'italic', lineHeight: 20 },
    bookRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.borderSubtle },
    bookTitle: { color: c.textSecondary },

    warPrayerCard: {
      backgroundColor: c.bgSunken, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: c.border,
    },
    warPrayerTitle: { color: c.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 8 },
    warPrayerText: { color: c.textFaint, lineHeight: 22, fontSize: 13 },
  });
}