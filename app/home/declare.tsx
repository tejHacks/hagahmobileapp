import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, type Theme } from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import { scriptureDeclarations, scriptureThemes, type ScriptureDeclaration } from "../../data/scripture_declarations";
import { speakable } from "../../utils/speech";
import { markToday } from "../../utils/streak";

const serif = Platform.select({ ios: "Georgia", default: "serif" });
type Filter = "All" | (typeof scriptureThemes)[number];

/**
 * Scripture declarations: King James verses that are already in the first
 * person ("The LORD is my shepherd; I shall not want."), spoken as written.
 */
export default function DeclareScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [filter, setFilter] = useState<Filter>("All");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queue = useRef<ScriptureDeclaration[]>([]);
  const listRef = useRef<FlatList<ScriptureDeclaration>>(null);

  const items = useMemo(
    () => (filter === "All" ? scriptureDeclarations : scriptureDeclarations.filter((d) => d.theme === filter)),
    [filter],
  );

  const stop = useCallback(() => {
    queue.current = [];
    setSpeakingId(null);
    Speech.stop();
  }, []);

  useEffect(() => stop, [stop]);

  const speakNext = useCallback(() => {
    const next = queue.current.shift();
    if (!next) {
      setSpeakingId(null);
      return;
    }
    setSpeakingId(next.id);
    const index = items.findIndex((d) => d.id === next.id);
    if (index >= 0) {
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.15 });
      } catch {}
    }
    Speech.speak(`${speakable(next.text)}. ${next.ref.replace(":", ", verse ")}.`, {
      rate: 0.92,
      onDone: speakNext,
      onError: stop,
    });
  }, [items, stop]);

  const play = (list: ScriptureDeclaration[]) => {
    Speech.stop();
    queue.current = [...list];
    void markToday();
    speakNext();
  };

  const copy = async (d: ScriptureDeclaration) => {
    await Clipboard.setStringAsync(`${d.text}\n— ${d.ref} (KJV)`);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId((c) => (c === d.id ? null : c)), 1800);
  };

  const playingAll = speakingId !== null && queue.current.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={20} color={theme.colors.accent} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>SCRIPTURE DECLARATIONS</Text>
          <Text style={styles.title}>Declare the Word</Text>
        </View>
      </View>
      <Text style={styles.intro}>
        {scriptureDeclarations.length} verses from the King James Bible, already in the first person. Speak them as written.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {(["All", ...scriptureThemes] as Filter[]).map((t) => {
          const on = t === filter;
          return (
            <Pressable
              key={t}
              onPress={() => {
                stop();
                setFilter(t);
              }}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.playAll}
        onPress={() => (speakingId ? stop() : play(items))}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Ionicons name={speakingId ? "stop" : "play"} size={16} color={theme.colors.onAccent} />
        <Text style={styles.playAllText}>
          {speakingId ? "Stop" : filter === "All" ? "Declare them all" : `Declare all: ${filter}`}
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => {
          const speaking = speakingId === item.id;
          return (
            <View style={[styles.card, speaking && styles.cardOn]}>
              <Text style={styles.ref}>{item.ref}</Text>
              <Text style={styles.text}>{item.text}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => (speaking && !playingAll ? stop() : play([item]))}
                  accessibilityRole="button"
                  accessibilityLabel={speaking ? `Stop ${item.ref}` : `Listen to ${item.ref}`}
                >
                  <Ionicons name={speaking ? "stop-circle-outline" : "volume-high-outline"} size={16} color={theme.colors.accent} />
                  <Text style={styles.actionText}>{speaking ? "Speaking" : "Listen"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.action} onPress={() => copy(item)} accessibilityRole="button" accessibilityLabel={`Copy ${item.ref}`}>
                  <Ionicons name={copiedId === item.id ? "checkmark" : "copy-outline"} size={16} color={theme.colors.accent} />
                  <Text style={styles.actionText}>{copiedId === item.id ? "Copied" : "Copy"}</Text>
                </TouchableOpacity>
                <Text style={styles.themeTag}>{item.theme}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: 140 }} />}
      />
      <Navbar />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgBase },
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 8 },
    back: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSubtle,
    },
    eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: c.accent },
    title: { fontFamily: serif, fontSize: 26, fontWeight: "700", color: c.textPrimary, marginTop: 2 },
    intro: { fontSize: 14, lineHeight: 21, color: c.textMuted, paddingHorizontal: 20, marginTop: 10 },
    chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSubtle,
    },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { fontSize: 13, fontWeight: "600", color: c.textSecondary },
    chipTextOn: { color: c.onAccent },
    playAll: {
      marginHorizontal: 20,
      marginBottom: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: c.accent,
    },
    playAllText: { color: c.onAccent, fontWeight: "700", fontSize: 14 },
    list: { paddingHorizontal: 20, paddingTop: 10, gap: 12 },
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    cardOn: { borderColor: c.accent, backgroundColor: c.tint },
    ref: { fontSize: 12, fontWeight: "700", letterSpacing: 1.2, color: c.accent, textTransform: "uppercase" },
    text: { fontFamily: serif, fontSize: 18, lineHeight: 28, color: c.textPrimary, marginTop: 8 },
    actions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 14 },
    action: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
    actionText: { fontSize: 13, fontWeight: "600", color: c.accent },
    themeTag: { marginLeft: "auto", fontSize: 11, color: c.textMuted },
  });
}
