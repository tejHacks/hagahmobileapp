import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, type GestureResponderHandlers } from "react-native";
import type { BibleBookMeta, BibleChapter } from "../../data/bible";
import { speakable } from "../../utils/speech";
import { markToday } from "../../utils/streak";
import type { Theme } from "../themes/theme";
import Verse from "./Verse";

export default function ReaderContent({
    verseNumbers,
    chapterData,
    currentBookMeta,
    selectedChapter,
    goPrevChapter,
    goNextChapter,
    panHandlers,
    selectedVerse,
    handleWordPress,
    handleVerseTap,
    handleVerseLongPress,
    styles,
    theme,
    fontSize = 19,
    showStrongs = false,
}: {
    verseNumbers: string[];
    chapterData: BibleChapter;
    currentBookMeta: BibleBookMeta | undefined;
    selectedChapter: number;
    goPrevChapter: () => void;
    goNextChapter: () => void;
    panHandlers?: GestureResponderHandlers;
    selectedVerse: string | null;
    handleWordPress: (code: string) => void;
    handleVerseTap: (v: string) => void;
    handleVerseLongPress: (v: string) => void;
    styles: any;
    theme: Theme;
    fontSize?: number;
    showStrongs?: boolean;
}) {
    const listRef = useRef<FlatList<string> | null>(null);

    const scrollToVerse = useCallback((vNum: string) => {
        const index = verseNumbers.indexOf(vNum);
        if (index < 0) return;
        try {
            listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.25 });
        } catch { }
    }, [verseNumbers]);

    // ── Read aloud ────────────────────────────────────────────────────────
    const [speakingVerse, setSpeakingVerse] = useState<string | null>(null);
    const speakingRef = useRef(false);

    const stopReading = useCallback(() => {
        speakingRef.current = false;
        setSpeakingVerse(null);
        Speech.stop();
    }, []);

    const readFrom = useCallback(
        (i: number) => {
            if (!speakingRef.current) return;
            if (i >= verseNumbers.length) {
                stopReading();
                void markToday();
                return;
            }
            const vNum = verseNumbers[i];
            setSpeakingVerse(vNum);
            scrollToVerse(vNum);
            Speech.speak(speakable(chapterData[vNum]?.text ?? ""), {
                rate: 0.95,
                onDone: () => readFrom(i + 1),
                onError: () => stopReading(),
            });
        },
        [chapterData, verseNumbers, stopReading, scrollToVerse],
    );

    const toggleReading = () => {
        if (speakingRef.current) {
            stopReading();
            return;
        }
        speakingRef.current = true;
        void markToday();
        const start = selectedVerse ? Math.max(0, verseNumbers.indexOf(selectedVerse)) : 0;
        Speech.stop();
        readFrom(start);
    };

    // Stop when the chapter changes or the reader closes.
    useEffect(() => stopReading, [chapterData, stopReading]);

    // Reading a chapter for 30 seconds counts towards the streak.
    useEffect(() => {
        const t = setTimeout(() => void markToday(), 30000);
        return () => clearTimeout(t);
    }, [chapterData]);

    // A new chapter starts at the top.
    useEffect(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [chapterData]);

    // Bring a selected verse (e.g. from search) into view.
    useEffect(() => {
        if (selectedVerse) scrollToVerse(selectedVerse);
    }, [selectedVerse, scrollToVerse]);

    const atFirst = selectedChapter <= 1;
    const atLast = !currentBookMeta || selectedChapter >= currentBookMeta.chapters;

    const header = (
        <View style={styles.hero}>
            <Text style={styles.heroBook}>{currentBookMeta?.name.toUpperCase()}</Text>
            <Text style={styles.heroChapter}>{selectedChapter}</Text>
            <View style={styles.heroOrnament}>
                <View style={styles.heroRule} />
                <Text style={styles.heroVersion}>KING JAMES VERSION</Text>
                <View style={styles.heroRule} />
            </View>
        </View>
    );

    const footer = (
        <View>
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.navBtn, atFirst && styles.navBtnDisabled]}
                    onPress={goPrevChapter}
                    disabled={atFirst}
                    activeOpacity={0.75}
                >
                    <Ionicons name="chevron-back" size={16} color={theme.colors.accent} />
                    <Text style={styles.navBtnText}>Chapter {selectedChapter - 1 || ""}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn, atLast && styles.navBtnDisabled]}
                    onPress={goNextChapter}
                    disabled={atLast}
                    activeOpacity={0.75}
                >
                    <Text style={styles.navBtnText}>Chapter {atLast ? "" : selectedChapter + 1}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
                </TouchableOpacity>
            </View>
            <View style={{ height: 160 }} />
        </View>
    );

    return (
        <View style={{ flex: 1 }} {...panHandlers}>
            <FlatList
                ref={listRef}
                data={verseNumbers}
                renderItem={({ item: vNum }) => (
                    <Verse
                        vNum={vNum}
                        verse={chapterData[vNum]}
                        isSelected={selectedVerse === vNum || speakingVerse === vNum}
                        handleWordPress={handleWordPress}
                        handleVerseTap={handleVerseTap}
                        handleVerseLongPress={handleVerseLongPress}
                        styles={styles}
                        fontSize={fontSize}
                        showStrongs={showStrongs}
                    />
                )}
                keyExtractor={(v) => v}
                extraData={`${selectedVerse}|${speakingVerse}|${fontSize}|${showStrongs}`}
                ListHeaderComponent={header}
                ListFooterComponent={footer}
                contentContainerStyle={styles.readerContent}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={9}
                onScrollToIndexFailed={(info) => {
                    // The verse isn't laid out yet: jump near it, then try again.
                    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
                    setTimeout(() => {
                        try {
                            listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.25 });
                        } catch { }
                    }, 120);
                }}
            />
            <TouchableOpacity
                onPress={toggleReading}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={speakingVerse ? "Stop reading aloud" : "Read this chapter aloud"}
                style={styles.listenBtn}
            >
                <Ionicons name={speakingVerse ? "stop" : "volume-high"} size={17} color={theme.colors.onAccent} />
                <Text style={styles.listenText}>{speakingVerse ? `Verse ${speakingVerse}` : "Listen"}</Text>
            </TouchableOpacity>
        </View>
    );
}
