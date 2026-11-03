import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InteractionManager,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useTheme } from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import {
  BibleChapter,
  bibleBooks,
  getBookMeta,
  getChapterFromDb,
  prefetchBook,
  prefetchChapter,
} from "../../data/bible";
import { lookupStrongs, type StrongsEntry } from "../../utils/strongs";
import FontSettingsModal from "./bible/_FontSettingsModal";
import BooksGrid from "./bible/BooksGrid";
import ChaptersGrid from "./bible/ChaptersGrid";
import ReaderContent from "./bible/ReaderContent";
import SelectionBar from "./bible/SelectionBar";
import StrongsModal from "./bible/StrongsModal";
import TutorialModal from "./bible/TutorialModal";

const LAST_POSITION_KEY = "hagah_bible_last_position";
const TUTORIAL_SEEN_KEY = "hagah_bible_seen_tutorial";

type Phase = "books" | "chapters" | "reader";

export default function BibleScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [showTutorial, setShowTutorial] = useState(false);
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({ text: "", visible: false });

  const [phase, setPhase] = useState<Phase>("books");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [strongsModal, setStrongsModal] = useState<{ code: string; entry: StrongsEntry | null } | null>(null);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [showStrongs, setShowStrongs] = useState<boolean>(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  // ── restore last read position when the Bible screen receives focus ────
  // This ensures clicking the `Bible` tab/button returns the user to their
  // last-read book/chapter even if the component was already mounted.
  useFocusEffect(
    React.useCallback(() => {
      if (params?.book) return;
      let mounted = true;
      (async () => {
        const saved = await AsyncStorage.getItem(LAST_POSITION_KEY);
        if (!mounted || !saved) return;
        try {
          const { bookId, chapter } = JSON.parse(saved);
          if (bookId && getBookMeta(bookId)) {
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

  // show tutorial first time only
  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
      if (!seen) {
        setShowTutorial(true);
        await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, "1");
      }
    })();

    // warm common books in background after interactions so the UI is not blocked
    const task = InteractionManager.runAfterInteractions(() => {
      try {
        // Prefetch a short list of high-traffic books (Psalms, Matthew, John)
        prefetchBook("Psa");
        prefetchBook("Mat");
        prefetchBook("Jhn");
      } catch { }
    });
    return () => {
      task.cancel && task.cancel();
    };
  }, []);

  const openBook = async (bookId: string) => {
    setSelectedBookId(bookId);
    setChapterData(null);
    setSelectedVerse(null);
    setPhase("chapters");
    prefetchChapter(bookId, 1);
  };

  const openChapter = React.useCallback(async (chapter: number) => {
    if (!selectedBookId) return;
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    setPhase("reader");
    setLoading(true);
    try {
      console.log("[DEBUG] openChapter called", { selectedBookId, chapter });
      const data = await getChapterFromDb(selectedBookId, chapter);
      console.log("[DEBUG] getChapterFromDb returned chapter keys", Object.keys(data).length);
      setChapterData(data);
      const nextChapter = chapter + 1;
      const meta = getBookMeta(selectedBookId);
      if (meta && nextChapter <= meta.chapters) {
        prefetchChapter(selectedBookId, nextChapter);
      }
      AsyncStorage.setItem(
        LAST_POSITION_KEY,
        JSON.stringify({ bookId: selectedBookId, chapter }),
      ).catch(() => { });
    } finally {
      setLoading(false);
    }
  }, [selectedBookId]);

  // jump straight into reader if we restored a saved position
  useEffect(() => {
    if (selectedBookId && phase === "books" && chapterData === null) {
      openChapter(selectedChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBookId]);

  // If route includes book/chapter/verse (from search), navigate there
  useEffect(() => {
    const book = params?.book as string | undefined;
    const chapter = params?.chapter as string | undefined;
    const verse = params?.verse as string | undefined;
    if (book && getBookMeta(book)) {
      const chapNum = chapter ? Number(chapter) : 1;
      // clear previous state so we don't render old chapter content while
      // the new chapter loads (this caused mixed content previously)
      setSelectedBookId(book);
      setSelectedChapter(chapNum);
      setPhase("reader");
      setSelectedVerse(null);
      setChapterData(null);
      setLoading(true);
      (async () => {
        try {
          const data = await getChapterFromDb(book, chapNum);
          setChapterData(data);
          if (verse) setSelectedVerse(String(verse));
          AsyncStorage.setItem(LAST_POSITION_KEY, JSON.stringify({ bookId: book, chapter: chapNum })).catch(() => { });
        } finally {
          setLoading(false);
        }
      })();
    }

  }, [params?.book, params?.chapter, params?.verse]);

  const currentBookMeta = selectedBookId ? getBookMeta(selectedBookId) : undefined;

  const goPrevChapter = React.useCallback(() => {
    if (selectedChapter > 1) openChapter(selectedChapter - 1);
  }, [selectedChapter, openChapter]);
  const goNextChapter = React.useCallback(() => {
    if (currentBookMeta && selectedChapter < currentBookMeta.chapters) {
      openChapter(selectedChapter + 1);
    }
  }, [selectedChapter, currentBookMeta, openChapter]);

  const panResponderRef = useRef<any>(null);

  React.useEffect(() => {
    if (panResponderRef.current) return;
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt: any, g: any) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10,
      onPanResponderRelease: (_evt: any, g: any) => {
        const verseThreshold = 40;
        try {
          if (!chapterData) return;
          const list = Object.keys(chapterData).sort((a, b) => Number(a) - Number(b));
          const idx = selectedVerse ? list.indexOf(selectedVerse) : -1;
          if (g.dx < -verseThreshold) {
            // left swipe -> previous
            if (idx > 0) setSelectedVerse(list[idx - 1]); else goPrevChapter();
          } else if (g.dx > verseThreshold) {
            // right swipe -> next
            if (idx >= 0 && idx < list.length - 1) setSelectedVerse(list[idx + 1]); else goNextChapter();
          }
        } catch {
          // ignore
        }
      },
    });
  }, [chapterData, selectedVerse, goPrevChapter, goNextChapter]);

  const memoHandleWordPress = React.useCallback((code: string) => {
    const entry = lookupStrongs(code) ?? null;
    setStrongsModal({ code, entry });
  }, []);

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    setTimeout(() => setToast({ text: "", visible: false }), 1500);
  };

  const verseRef = (vNum: string) => `${currentBookMeta?.name} ${selectedChapter}:${vNum}`;



  const copyVerse = React.useCallback(async (vNum: string) => {
    const ref = `${currentBookMeta?.name} ${selectedChapter}:${vNum}`;
    const text = chapterData ? (chapterData[vNum]?.words || []).map((w) => w.t).join(" ") : "";
    await Clipboard.setStringAsync(`${ref} ${text}`);
    setToast({ text: "Verse copied", visible: true });
    setTimeout(() => setToast({ text: "", visible: false }), 1500);
  }, [chapterData, currentBookMeta, selectedChapter]);

  const memoHandleVerseTap = React.useCallback((vNum: string) => {
    setSelectedVerse((prev) => (prev === vNum ? null : vNum));
  }, []);

  const memoHandleVerseLongPress = React.useCallback((vNum: string) => {
    setSelectedVerse(null);
    copyVerse(vNum);
  }, [copyVerse]);

  const copyStrongsEntry = async () => {
    if (!strongsModal) return;
    const { code, entry } = strongsModal;
    if (!entry) return;
    const parts = [
      entry.lemma ? entry.lemma : "",
      entry.xlit ? `(${entry.xlit}${entry.pron ? `, ${entry.pron}` : ""})` : "",
      code,
      entry.def ? `— ${entry.def}` : "",
    ].filter(Boolean);
    await Clipboard.setStringAsync(parts.join(" "));
    showToast("Word copied");
  };

  // ── BOOKS ────────────────────────────────────────────────────────────────
  if (phase === "books") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SCRIPTURE</Text>
            <Text style={styles.title}>Bible</Text>
          </View>
          <View style={styles.headerBadgeRow}>
            <TouchableOpacity onPress={() => setShowTutorial(true)} hitSlop={10} style={styles.helpBtn}>
              <Ionicons name="help-circle-outline" size={22} color={theme.colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/home/search')} hitSlop={10} style={styles.helpBtn}>
              <Ionicons name="search" size={20} color={theme.colors.accent} />
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <Ionicons name="book" size={20} color={theme.colors.accent} />
            </View>
          </View>
        </View>

        <BooksGrid books={bibleBooks} openBook={openBook} prefetchBook={prefetchBook} styles={styles} />

        <Navbar />
        <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} styles={styles} />
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
            <TouchableOpacity onPress={() => setShowTutorial(true)} hitSlop={10}>
              <Ionicons name="help-circle-outline" size={22} color={theme.colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/home/search')} hitSlop={10} style={{ marginLeft: 8 }}>
              <Ionicons name="search" size={20} color={theme.colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowStrongs((s) => !s)} hitSlop={10} style={{ marginLeft: 8 }}>
              <Text style={{ color: showStrongs ? theme.colors.accent : theme.colors.textDisabled, fontWeight: "800" }}>S</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ChaptersGrid
          currentBookMeta={currentBookMeta}
          openChapter={openChapter}
          prefetchChapter={prefetchChapter}
          selectedBookId={selectedBookId}
          styles={styles}
        />

        <Navbar />
        <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} styles={styles} />
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
          <Text style={styles.backText}>Chapters</Text>
        </TouchableOpacity>
        <View style={styles.headerBadgeRow}>
          <TouchableOpacity onPress={() => setShowTutorial(true)} hitSlop={10}>
            <Ionicons name="help-circle-outline" size={22} color={theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/home/search')} hitSlop={10} style={{ marginLeft: 8 }}>
            <Ionicons name="search" size={20} color={theme.colors.accent} />
          </TouchableOpacity>
          {phase === "reader" && (
            <>
              <TouchableOpacity onPress={() => setShowFontSettings(true)} hitSlop={10} style={{ marginLeft: 8 }}>
                <Ionicons name="settings" size={20} color={theme.colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowStrongs((s) => !s)} hitSlop={10} style={{ marginLeft: 8 }}>
                <Text style={{ color: showStrongs ? theme.colors.accent : theme.colors.textDisabled, fontWeight: "800" }}>S</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {loading || !chapterData ? (
        <View style={styles.loadingBox}>
          {/* Non-blocking skeleton placeholders to avoid intrusive spinner */}
          <View style={{ width: "60%", height: 18, backgroundColor: theme.colors.bgSurface, borderRadius: 8, marginBottom: 12 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ width: "100%", height: 18, backgroundColor: theme.colors.bgSurface, borderRadius: 6, marginBottom: 10, opacity: 0.9 - i * 0.06 }} />
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
          panHandlers={panResponderRef.current?.panHandlers}
          selectedVerse={selectedVerse}
          handleWordPress={memoHandleWordPress}
          handleVerseTap={memoHandleVerseTap}
          handleVerseLongPress={memoHandleVerseLongPress}
          styles={styles}
          theme={theme}
          fontSize={fontSize}
          showStrongs={showStrongs}
        />
      )}

      {/* create pan responder once we know chapterData and verseNumbers */}


      {/* Floating copy bar when a verse is selected */}
      {selectedVerse && (
        <SelectionBar
          selectionRef={verseRef(selectedVerse)}
          onCopy={() => {
            copyVerse(selectedVerse);
            setSelectedVerse(null);
          }}
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

      {/* Search handled by routed page: /home/bible/search */}

      <FontSettingsModal
        visible={showFontSettings}
        onClose={() => setShowFontSettings(false)}
        fontSize={fontSize}
        setFontSize={(v: number) => setFontSize(v)}
        styles={styles}
        theme={theme}
      />

      <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} styles={styles} />

      {/* Toast */}
      {toast.visible && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast.text}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// TutorialModal extracted to ./bible/TutorialModal.tsx

function createStyles(theme: Theme) {
  const c = theme.colors;
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
    title: { color: c.textPrimary, fontSize: 24, fontWeight: "800" },
    headerBadge: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: c.tint,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: c.border,
    },
    headerBadgeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    helpBtn: {},
    backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    backText: { color: c.accent, fontSize: 14, fontWeight: "700" },

    scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

    groupLabel: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      marginTop: 16,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    bookCardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
    bookCard: {
      width: "48%",
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    bookCardLeft: { width: 56, height: 56, borderRadius: 10, backgroundColor: c.bgSurface, alignItems: "center", justifyContent: "center", marginRight: 12 },
    bookCardAbbrev: { color: c.textSecondary, fontSize: 14, fontWeight: "800" },
    bookCardRight: { flex: 1 },
    bookCardName: { color: c.textPrimary, fontSize: 15, fontWeight: "800" },
    bookCardMeta: { color: c.textFaint, fontSize: 11, marginTop: 4 },

    bookTitle: { color: c.textPrimary, fontSize: 26, fontWeight: "800", marginTop: 8 },
    chapterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chapterChip: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: c.bgSurface,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    chapterChipText: { color: c.textPrimary, fontSize: 14, fontWeight: "700" },

    loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },

    readerContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },

    // ── Hero (YouVersion-style centered header) ──
    hero: { alignItems: "center", marginBottom: 28, marginTop: 6 },
    heroBook: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 1,
      marginBottom: 2,
    },
    heroChapter: {
      color: c.textPrimary,
      fontSize: 64,
      fontWeight: "800",
      lineHeight: 68,
    },
    heroBadge: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
    },
    heroBadgeText: { color: c.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },

    paragraphWrap: {},
    verseBlock: {
      color: c.textPrimary,
      fontSize: 18,
      lineHeight: 32,
      marginBottom: 18, // ← breathing room between verses
    },
    verseNumSuper: {
      color: c.accent,
      fontSize: 11,
      fontWeight: "800",
      lineHeight: 32,
    },
    wordUnderline: {
      textDecorationLine: "underline",
      textDecorationColor: c.borderSubtle,
    },
    strongsWord: {
      textDecorationLine: "underline",
      textDecorationColor: c.accent,
      textDecorationStyle: "solid",
      color: c.textPrimary,
      fontWeight: "600",
    },
    italicWord: { fontStyle: "italic", color: c.textMuted },
    selectedWord: {
      backgroundColor: "rgba(143, 191, 143, 0.28)",
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
      borderRadius: 10, backgroundColor: c.tint,
      borderWidth: 1, borderColor: c.border,
    },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { color: c.accent, fontSize: 13, fontWeight: "700" },
    navBtnTextDisabled: { color: c.textDisabled },

    tapHint: {
      color: c.textFaint,
      fontSize: 11,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 20,
      lineHeight: 16,
    },

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
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    selectionRef: { color: c.textSecondary, fontSize: 12, fontWeight: "700", flex: 1, marginRight: 8 },
    selectionActions: { flexDirection: "row", alignItems: "center", gap: 14 },
    selectionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    selectionBtnText: { color: c.accent, fontSize: 13, fontWeight: "700" },

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
    strongsHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    strongsCode: { color: c.accent, fontSize: 16, fontWeight: "800", flex: 1 },
    strongsLang: { color: c.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
    strongsLemma: { color: c.textPrimary, fontSize: 24, marginBottom: 2 },
    strongsXlit: { color: c.textSecondary, fontSize: 13, fontStyle: "italic", marginBottom: 10 },
    strongsSectionLabel: {
      color: c.textFaint,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.6,
      marginTop: 10,
      marginBottom: 4,
    },
    strongsBody: { color: c.textPrimary, fontSize: 13, lineHeight: 20 },

    tutorialCard: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: c.bgElevated,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "flex-start",
      gap: 14,
    },
    tutorialRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    tutorialText: { color: c.textPrimary, fontSize: 13, lineHeight: 19, flex: 1 },
    tutorialClose: {
      marginTop: 4,
      alignSelf: "flex-end",
      padding: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
    },

    toast: {
      position: "absolute",
      bottom: 90,
      alignSelf: "center",
      backgroundColor: c.bgElevated,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    toastText: { color: c.textPrimary, fontSize: 13 },
  });
}