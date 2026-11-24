import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BooksGrid from "../../components/bible/BooksGrid";
import ChaptersGrid from "../../components/bible/ChaptersGrid";
import ReaderContent from "../../components/bible/ReaderContent";
import ReadingSettingsModal, { FONT_SIZES } from "../../components/bible/ReadingSettingsModal";
import SelectionBar from "../../components/bible/SelectionBar";
import StrongsModal from "../../components/bible/StrongsModal";
import TutorialModal from "../../components/bible/TutorialModal";
import { Theme, useTheme } from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import {
  BibleChapter,
  getBookMeta,
  getChapterFromDb,
  plainVerseText,
  prefetchBook,
  prefetchChapter,
} from "../../data/bible";
import { lookupStrongs, type StrongsEntry } from "../../utils/strongs";

const LAST_POSITION_KEY = "hagah_bible_last_position";
const TUTORIAL_SEEN_KEY = "hagah_bible_seen_tutorial";
const READING_PREFS_KEY = "hagah_bible_reading_prefs";

const serif = Platform.select({ ios: "Georgia", default: "serif" });

type Phase = "books" | "chapters" | "reader";
type Position = { bookId: string; chapter: number };

export default function BibleScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [showTutorial, setShowTutorial] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("books");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);

  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [strongsModal, setStrongsModal] = useState<{ code: string; entry: StrongsEntry | null } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSizeState] = useState<number>(19);
  const [showStrongs, setShowStrongsState] = useState<boolean>(false);

  // ── reading preferences survive restarts ───────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(READING_PREFS_KEY)
      .then((raw) => {
        if (!raw) return;
        const prefs = JSON.parse(raw);
        if (FONT_SIZES.includes(prefs.fontSize)) setFontSizeState(prefs.fontSize);
        if (typeof prefs.showStrongs === "boolean") setShowStrongsState(prefs.showStrongs);
      })
      .catch(() => { });
  }, []);

  const savePrefs = (next: { fontSize: number; showStrongs: boolean }) => {
    AsyncStorage.setItem(READING_PREFS_KEY, JSON.stringify(next)).catch(() => { });
  };
  const setFontSize = (v: number) => {
    setFontSizeState(v);
    savePrefs({ fontSize: v, showStrongs });
  };
  const setShowStrongs = (v: boolean) => {
    setShowStrongsState(v);
    savePrefs({ fontSize, showStrongs: v });
  };

  // ── restore last read position when the Bible screen receives focus ────
  useFocusEffect(
    useCallback(() => {
      if (params?.book) return;
      let mounted = true;
      (async () => {
        const saved = await AsyncStorage.getItem(LAST_POSITION_KEY);
        if (!mounted || !saved) return;
        try {
          const { bookId, chapter } = JSON.parse(saved);
          if (bookId && getBookMeta(bookId)) {
            setLastPosition({ bookId, chapter: chapter || 1 });
            setSelectedBookId(bookId);
            setSelectedChapter(chapter || 1);
          }
        } catch {
          // ignore
        }
      })();
      return () => {
        mounted = false;
      };
    }, [params?.book])
  );

  // show tutorial first time only; warm common books in the background
  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
      if (!seen) {
        setShowTutorial(true);
        await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, "1");
      }
    })();
    const task = setTimeout(() => {
      prefetchBook("Psa");
      prefetchBook("Mat");
      prefetchBook("Jhn");
    }, 800);
    return () => clearTimeout(task);
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  };

  const rememberPosition = (pos: Position) => {
    setLastPosition(pos);
    AsyncStorage.setItem(LAST_POSITION_KEY, JSON.stringify(pos)).catch(() => { });
  };

  const loadChapter = async (bookId: string, chapter: number, verse?: string) => {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    setChapterData(null);
    setPhase("reader");
    setLoading(true);
    try {
      const data = await getChapterFromDb(bookId, chapter);
      setChapterData(data);
      if (verse) setSelectedVerse(verse);
      const meta = getBookMeta(bookId);
      if (meta && chapter < meta.chapters) prefetchChapter(bookId, chapter + 1);
      rememberPosition({ bookId, chapter });
    } catch {
      showToast("Couldn't open that chapter. Please try again.");
      setPhase("chapters");
    } finally {
      setLoading(false);
    }
  };

  const openBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setChapterData(null);
    setSelectedVerse(null);
    setPhase("chapters");
    prefetchChapter(bookId, 1);
  };

  const openChapter = (chapter: number) => {
    if (selectedBookId) loadChapter(selectedBookId, chapter);
  };

  // jump straight into the reader when a saved position was restored
  useEffect(() => {
    if (selectedBookId && phase === "books" && chapterData === null) {
      loadChapter(selectedBookId, selectedChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBookId]);

  // a route with book/chapter/verse (from search) opens that verse
  useEffect(() => {
    const book = params?.book as string | undefined;
    if (book && getBookMeta(book)) {
      const chapter = params?.chapter ? Number(params.chapter) : 1;
      const verse = params?.verse ? String(params.verse) : undefined;
      loadChapter(book, chapter, verse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.book, params?.chapter, params?.verse]);

  const currentBookMeta = selectedBookId ? getBookMeta(selectedBookId) : undefined;

  const goPrevChapter = () => {
    if (selectedBookId && selectedChapter > 1) loadChapter(selectedBookId, selectedChapter - 1);
  };
  const goNextChapter = () => {
    if (selectedBookId && currentBookMeta && selectedChapter < currentBookMeta.chapters) {
      loadChapter(selectedBookId, selectedChapter + 1);
    }
  };

  // Swipe between chapters. The responder is created once, so it reads the
  // latest navigation functions from a ref instead of a stale closure.
  const swipeRef = useRef({ prev: () => { }, next: () => { } });
  useEffect(() => {
    swipeRef.current = { prev: goPrevChapter, next: goNextChapter };
  });
  // The handlers only read the ref when a gesture ends, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [swipe] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -60) swipeRef.current.next();
        else if (g.dx > 60) swipeRef.current.prev();
      },
      onPanResponderTerminationRequest: () => true,
    })
  );

  const verseRef = (vNum: string) => `${currentBookMeta?.name} ${selectedChapter}:${vNum}`;
  const verseText = (vNum: string) => plainVerseText(chapterData?.[vNum]?.text ?? "");

  const copyVerse = async (vNum: string) => {
    await Clipboard.setStringAsync(`"${verseText(vNum)}" — ${verseRef(vNum)} (KJV)`);
    showToast("Verse copied");
  };

  const shareVerse = (vNum: string) => {
    Share.share({ message: `"${verseText(vNum)}" — ${verseRef(vNum)} (KJV)` }).catch(() => { });
  };

  const handleWordPress = useCallback((code: string) => {
    setStrongsModal({ code, entry: lookupStrongs(code) ?? null });
  }, []);

  const handleVerseTap = useCallback((vNum: string) => {
    setSelectedVerse((prev) => (prev === vNum ? null : vNum));
  }, []);

  const longPressRef = useRef<(v: string) => void>(() => { });
  useEffect(() => {
    longPressRef.current = (vNum: string) => {
      setSelectedVerse(null);
      copyVerse(vNum);
    };
  });
  const handleVerseLongPress = useCallback((vNum: string) => longPressRef.current(vNum), []);

  const copyStrongsEntry = async () => {
    const entry = strongsModal?.entry;
    if (!strongsModal || !entry) return;
    const parts = [
      entry.lemma ?? "",
      entry.xlit ? `(${entry.xlit}${entry.pron ? `, ${entry.pron}` : ""})` : "",
      strongsModal.code,
      entry.def ? `— ${entry.def}` : "",
    ].filter(Boolean);
    await Clipboard.setStringAsync(parts.join(" "));
    showToast("Word copied");
  };

  const iconBtn = (icon: keyof typeof Ionicons.glyphMap, onPress: () => void, label: string) => (
    <TouchableOpacity onPress={onPress} hitSlop={10} style={styles.iconBtn} accessibilityLabel={label}>
      <Ionicons name={icon} size={19} color={theme.colors.accent} />
    </TouchableOpacity>
  );

  const toastView = toast && (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{toast}</Text>
    </View>
  );

  // ── BOOKS ────────────────────────────────────────────────────────────────
  if (phase === "books") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SCRIPTURE</Text>
            <Text style={styles.title}>The Holy Bible</Text>
          </View>
          <View style={styles.headerBadgeRow}>
            {iconBtn("help-circle-outline", () => setShowTutorial(true), "How to use the reader")}
            {iconBtn("search", () => router.push("/home/search"), "Search the Bible")}
          </View>
        </View>

        <BooksGrid
          openBook={openBook}
          prefetchBook={prefetchBook}
          lastPosition={lastPosition}
          onContinue={() => lastPosition && loadChapter(lastPosition.bookId, lastPosition.chapter)}
          styles={styles}
          theme={theme}
        />

        <Navbar />
        <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} styles={styles} />
        {toastView}
      </SafeAreaView>
    );
  }

  // ── CHAPTERS ─────────────────────────────────────────────────────────────
  if (phase === "chapters" && currentBookMeta) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPhase("books")} hitSlop={12} style={styles.backRow}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
            <Text style={styles.backText}>Books</Text>
          </TouchableOpacity>
          <View style={styles.headerBadgeRow}>
            {iconBtn("search", () => router.push("/home/search"), "Search the Bible")}
          </View>
        </View>

        <ChaptersGrid
          currentBookMeta={currentBookMeta}
          openChapter={openChapter}
          prefetchChapter={prefetchChapter}
          lastChapter={lastPosition?.bookId === currentBookMeta.id ? lastPosition.chapter : null}
          styles={styles}
        />

        <Navbar />
        {toastView}
      </SafeAreaView>
    );
  }

  // ── READER ───────────────────────────────────────────────────────────────
  const verseNumbers = chapterData
    ? Object.keys(chapterData).sort((a, b) => Number(a) - Number(b))
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setPhase("chapters")} hitSlop={12} style={styles.backRow}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
          <Text style={styles.backText} numberOfLines={1}>{currentBookMeta?.name ?? "Chapters"}</Text>
        </TouchableOpacity>
        <View style={styles.headerBadgeRow}>
          {iconBtn("search", () => router.push("/home/search"), "Search the Bible")}
          <TouchableOpacity onPress={() => setShowSettings(true)} hitSlop={10} style={styles.iconBtn} accessibilityLabel="Reading settings">
            <Text style={styles.aaText}>Aa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading || !chapterData ? (
        <View style={styles.loadingBox}>
          <View style={[styles.skeleton, { width: "30%", height: 14, alignSelf: "center" }]} />
          <View style={[styles.skeleton, { width: 56, height: 56, alignSelf: "center", marginBottom: 32 }]} />
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={[styles.skeleton, { width: i % 3 === 2 ? "70%" : "100%", opacity: 0.9 - i * 0.08 }]} />
          ))}
        </View>
      ) : (
        <ReaderContent
          verseNumbers={verseNumbers}
          chapterData={chapterData}
          currentBookMeta={currentBookMeta}
          selectedChapter={selectedChapter}
          goPrevChapter={goPrevChapter}
          goNextChapter={goNextChapter}
          panHandlers={swipe.panHandlers}
          selectedVerse={selectedVerse}
          handleWordPress={handleWordPress}
          handleVerseTap={handleVerseTap}
          handleVerseLongPress={handleVerseLongPress}
          styles={styles}
          theme={theme}
          fontSize={fontSize}
          showStrongs={showStrongs}
        />
      )}

      {selectedVerse && (
        <SelectionBar
          selectionRef={verseRef(selectedVerse)}
          onCopy={() => {
            copyVerse(selectedVerse);
            setSelectedVerse(null);
          }}
          onShare={() => shareVerse(selectedVerse)}
          onClose={() => setSelectedVerse(null)}
          styles={styles}
          theme={theme}
        />
      )}

      <StrongsModal
        strongsModal={strongsModal}
        visible={!!strongsModal}
        onClose={() => setStrongsModal(null)}
        copyStrongsEntry={copyStrongsEntry}
        styles={styles}
        theme={theme}
      />

      <ReadingSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showStrongs={showStrongs}
        setShowStrongs={setShowStrongs}
        onShowHelp={() => setShowTutorial(true)}
        styles={styles}
        theme={theme}
      />

      <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} styles={styles} />
      {toastView}
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  const dark = theme.scheme === "dark";
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgBase },

    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    eyebrow: { color: c.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2.6 },
    title: { fontFamily: serif, color: c.textPrimary, fontSize: 26, fontWeight: "700", marginTop: 2 },
    headerBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
      width: 38, height: 38, borderRadius: 19,
      alignItems: "center", justifyContent: "center",
      backgroundColor: c.tint, borderWidth: 1, borderColor: c.border,
    },
    aaText: { fontFamily: serif, color: c.accent, fontSize: 16, fontWeight: "700" },
    backRow: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1, marginRight: 12 },
    backText: { color: c.accent, fontSize: 15, fontWeight: "700" },

    scrollContent: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20 },

    // ── Books ──
    continueCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginBottom: 18,
    },
    continueEyebrow: { color: c.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
    continueTitle: { fontFamily: serif, color: c.textPrimary, fontSize: 22, marginTop: 4 },
    continueArrow: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: c.accent, alignItems: "center", justifyContent: "center",
    },
    segment: {
      flexDirection: "row",
      backgroundColor: c.bgSunken,
      borderRadius: 12,
      padding: 4,
      marginBottom: 6,
    },
    segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
    segmentItemActive: {
      backgroundColor: c.bgElevated,
      shadowColor: "#000",
      shadowOpacity: dark ? 0 : 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: dark ? 0 : 1,
    },
    segmentText: { color: c.textMuted, fontSize: 13, fontWeight: "600" },
    segmentTextActive: { color: c.textPrimary, fontWeight: "700" },
    section: { marginTop: 22 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
    sectionTitle: { color: c.accent, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
    sectionRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.border },
    bookGrid: { flexDirection: "row", flexWrap: "wrap" },
    bookCell: {
      width: "50%",
      paddingVertical: 12,
      paddingRight: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderSubtle,
    },
    bookName: { fontFamily: serif, color: c.textPrimary, fontSize: 17 },
    bookMeta: { color: c.textFaint, fontSize: 11, marginTop: 3 },

    // ── Chapters ──
    bookTitle: { fontFamily: serif, color: c.textPrimary, fontSize: 34, fontWeight: "700", marginTop: 4 },
    bookSubtitle: { color: c.textFaint, fontSize: 12, marginTop: 4, marginBottom: 20, letterSpacing: 0.3 },
    chapterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chapterChip: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    chapterChipActive: { backgroundColor: c.accent, borderColor: c.accent },
    chapterChipText: { fontFamily: serif, color: c.textPrimary, fontSize: 17 },
    chapterChipTextActive: { color: c.onAccent, fontWeight: "700" },

    // ── Reader ──
    loadingBox: { flex: 1, paddingHorizontal: 26, paddingTop: 24 },
    skeleton: { height: 16, backgroundColor: c.bgSunken, borderRadius: 6, marginBottom: 14 },

    readerContent: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 20 },

    hero: { alignItems: "center", marginBottom: 30, marginTop: 8 },
    heroBook: { color: c.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 3.2 },
    heroChapter: { fontFamily: serif, color: c.textPrimary, fontSize: 72, lineHeight: 84, marginTop: 2 },
    heroOrnament: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    heroRule: { width: 28, height: StyleSheet.hairlineWidth, backgroundColor: c.gold },
    heroVersion: { color: c.gold, fontSize: 9, fontWeight: "700", letterSpacing: 2 },

    psalmTitle: {
      fontFamily: serif,
      fontStyle: "italic",
      color: c.textMuted,
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 24,
    },
    verseBlock: {
      fontFamily: serif,
      color: c.textPrimary,
      marginBottom: 14,
      borderRadius: 6,
    },
    verseSelected: {
      backgroundColor: dark ? "rgba(140,207,184,0.14)" : "rgba(47,93,80,0.10)",
    },
    verseNum: {
      fontFamily: Platform.select({ ios: "System", default: "sans-serif" }),
      color: c.accent,
      fontWeight: "700",
    },
    italicWord: { fontStyle: "italic", color: c.textMuted },
    strongsWord: {
      textDecorationLine: "underline",
      textDecorationStyle: "dotted",
      textDecorationColor: c.accent,
    },

    navRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 30,
    },
    navBtn: {
      flexDirection: "row", alignItems: "center", gap: 4,
      paddingHorizontal: 14, paddingVertical: 10,
      borderRadius: 999, backgroundColor: c.tint,
      borderWidth: 1, borderColor: c.border,
    },
    navBtnDisabled: { opacity: 0 },
    navBtnText: { color: c.accent, fontSize: 13, fontWeight: "700" },

    listenBtn: {
      position: "absolute",
      right: 18,
      bottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: c.accent,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    listenText: { color: c.onAccent, fontWeight: "700", fontSize: 14 },

    // ── Floating selection bar ──
    selectionBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 88,
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    selectionRef: { fontFamily: serif, color: c.textPrimary, fontSize: 15, flex: 1, marginRight: 8 },
    selectionActions: { flexDirection: "row", alignItems: "center", gap: 16 },
    selectionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    selectionBtnText: { color: c.accent, fontSize: 13, fontWeight: "700" },

    // ── Modals ──
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    strongsCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: c.bgElevated,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
      gap: 4,
    },
    strongsHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    strongsCode: { color: c.accent, fontSize: 16, fontWeight: "800", flex: 1 },
    strongsLang: { color: c.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
    strongsLemma: { fontFamily: serif, color: c.textPrimary, fontSize: 28, marginBottom: 2 },
    strongsXlit: { color: c.textSecondary, fontSize: 13, fontStyle: "italic", marginBottom: 10 },
    strongsSectionLabel: {
      color: c.textFaint,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.6,
      marginTop: 10,
      marginBottom: 4,
    },
    strongsBody: { color: c.textPrimary, fontSize: 14, lineHeight: 21 },

    settingsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    settingsTitle: { fontFamily: serif, color: c.textPrimary, fontSize: 22, fontWeight: "700" },
    settingsPreview: {
      fontFamily: serif,
      color: c.textPrimary,
      backgroundColor: c.bgBase,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderSubtle,
    },
    settingsLabel: { color: c.textPrimary, fontSize: 15, fontWeight: "600" },
    settingsHint: { color: c.textFaint, fontSize: 12, lineHeight: 17, marginTop: 2 },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    stepperBtn: { width: 48, height: 38, alignItems: "center", justifyContent: "center" },
    stepperDivider: { width: StyleSheet.hairlineWidth, height: 22, backgroundColor: c.border },
    stepperGlyph: { fontFamily: serif, color: c.accent, fontWeight: "700" },

    tutorialCard: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: c.bgElevated,
      borderRadius: 18,
      padding: 22,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "flex-start",
      gap: 14,
    },
    tutorialRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    tutorialText: { color: c.textPrimary, fontSize: 14, lineHeight: 20, flex: 1 },
    tutorialClose: {
      marginTop: 4,
      alignSelf: "flex-end",
      padding: 8,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
    },

    toast: {
      position: "absolute",
      bottom: 150,
      alignSelf: "center",
      backgroundColor: c.textPrimary,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 999,
    },
    toastText: { color: c.bgBase, fontSize: 13, fontWeight: "600" },
  });
}
