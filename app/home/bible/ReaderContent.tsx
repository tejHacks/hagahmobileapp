import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, findNodeHandle, LayoutChangeEvent } from "react-native";
import { speakable } from "../../../utils/speech";
import { markToday } from "../../../utils/streak";
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
    fontSize = 18,
    showStrongs = true,
}: any) {
    const scrollRef = useRef<FlatList<string> | null>(null);
    const verseRefs = useRef<Record<string, React.ComponentRef<typeof View> | null>>({});
    const itemHeights = useRef<Record<string, number>>({});
    const averageHeight = useRef<number>(0);
    const headerHeight = useRef<number>(0);

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
            if (!speakingRef.current || !chapterData) return;
            if (i >= verseNumbers.length) {
                stopReading();
                void markToday();
                return;
            }
            const vNum = verseNumbers[i];
            const verse = chapterData[vNum];
            setSpeakingVerse(vNum);
            try { scrollRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.2 }); } catch { }
            Speech.speak(speakable(verse?.text ?? ""), {
                rate: 0.95,
                onDone: () => readFrom(i + 1),
                onStopped: () => {},
                onError: () => stopReading(),
            });
        },
        [chapterData, verseNumbers, stopReading],
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
        if (!chapterData) return;
        const t = setTimeout(() => void markToday(), 30000);
        return () => clearTimeout(t);
    }, [chapterData]);

    // When a new chapter loads, reset any stored refs and ensure scroll
    // position starts at top to avoid showing the previous chapter's offset.
    useEffect(() => {
        // clear refs so measureLayout won't reference old nodes
        verseRefs.current = {};
        // reset scroll to top
        try {
            scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
        } catch {
            // ignore
        }
    }, [chapterData]);

    useEffect(() => {
        if (!selectedVerse) return;
        const ref = verseRefs.current[selectedVerse];
        const fl = scrollRef.current;
        const index = verseNumbers.indexOf(selectedVerse);

        if (ref && fl) {
            try {
                // Only call measureLayout when the ref exposes it (native component).
                // On Fabric the ref may not have measureLayout and calling it will
                // throw — guard against that and fall back to scrollToIndex.
                // @ts-ignore
                const canMeasure = typeof ref.measureLayout === "function";
                const handle = findNodeHandle(fl);
                if (canMeasure && handle) {
                    // @ts-ignore - measureLayout exists on native components
                    ref.measureLayout(handle, (x: number, y: number) => {
                        fl.scrollToOffset({ offset: Math.max(0, y - 20), animated: true });
                    }, () => {
                        if (index >= 0) {
                            try { fl.scrollToIndex({ index, animated: true }); } catch { }
                        }
                    });
                } else if (index >= 0) {
                    // fallback
                    try { fl.scrollToIndex({ index, animated: true }); } catch { }
                }
            } catch {
                if (index >= 0) {
                    try { fl.scrollToIndex({ index, animated: true }); } catch { }
                }
            }
        } else if (fl && index >= 0) {
            try { fl.scrollToIndex({ index, animated: true }); } catch { }
        }
    }, [selectedVerse, verseNumbers]);

    const onItemLayout = (vNum: string) => (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        itemHeights.current[vNum] = h;
        // update average
        const vals = Object.values(itemHeights.current);
        averageHeight.current = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    };

    const renderItem = ({ item: vNum, index }: { item: string; index: number }) => (
        <View key={vNum} ref={(r) => { verseRefs.current[vNum] = r; }} onLayout={onItemLayout(vNum)}>
            <Verse
                vNum={vNum}
                verse={chapterData![vNum]}
                isSelected={selectedVerse === vNum || speakingVerse === vNum}
                handleWordPress={handleWordPress}
                handleVerseTap={handleVerseTap}
                handleVerseLongPress={handleVerseLongPress}
                styles={styles}
                fontSize={fontSize}
                showStrongs={showStrongs}
            />
        </View>
    );

    const ListHeader = () => (
        <View onLayout={(e) => { headerHeight.current = e.nativeEvent.layout.height; }}>
            <View style={styles.hero}>
                <Text style={styles.heroBook}>{currentBookMeta?.name}</Text>
                <Text style={styles.heroChapter}>{selectedChapter}</Text>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>KJV</Text>
                </View>
            </View>
        </View>
    );

    const ListFooter = () => (
        <View>
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.navBtn, selectedChapter <= 1 && styles.navBtnDisabled]}
                    onPress={goPrevChapter}
                    disabled={selectedChapter <= 1}
                    activeOpacity={0.75}
                >
                    <Ionicons name="chevron-back" size={16} color={selectedChapter <= 1 ? theme.colors.textDisabled : theme.colors.accent} />
                    <Text style={[styles.navBtnText, selectedChapter <= 1 && styles.navBtnTextDisabled]}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navBtn,
                        currentBookMeta && selectedChapter >= currentBookMeta.chapters && styles.navBtnDisabled,
                    ]}
                    onPress={goNextChapter}
                    disabled={!currentBookMeta || selectedChapter >= currentBookMeta.chapters}
                    activeOpacity={0.75}
                >
                    <Text
                        style={[
                            styles.navBtnText,
                            currentBookMeta && selectedChapter >= currentBookMeta.chapters && styles.navBtnTextDisabled,
                        ]}
                    >
                        Next
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={
                            currentBookMeta && selectedChapter >= currentBookMeta.chapters
                                ? theme.colors.textDisabled
                                : theme.colors.accent
                        }
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.tapHint}>
                Tap a strong-underlined word for its Strong&apos;s definition · tap any verse to select it · long-press to copy instantly.
            </Text>

            <View style={{ height: 140 }} />
        </View>
    );

    const getItemLayout = (_: any, index: number) => {
        // compute offset by summing known heights or using average for unknowns
        const avg = averageHeight.current || 120;
        let offset = headerHeight.current || 0;
        for (let i = 0; i < index; i++) {
            const h = itemHeights.current[verseNumbers[i]] ?? avg;
            offset += h;
        }
        const length = itemHeights.current[verseNumbers[index]] ?? avg;
        return { length, offset, index };
    };

    return (
        <View style={{ flex: 1 }}>
        <FlatList
            ref={(r) => { scrollRef.current = r; }}
            data={verseNumbers}
            renderItem={renderItem}
            keyExtractor={(v) => v}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            contentContainerStyle={styles.readerContent}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            showsVerticalScrollIndicator={true}
            getItemLayout={getItemLayout}
            removeClippedSubviews
            onScrollToIndexFailed={() => {}}
            {...panHandlers}
        />
        <TouchableOpacity
            onPress={toggleReading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={speakingVerse ? "Stop reading aloud" : "Read this chapter aloud"}
            style={{
                position: "absolute",
                right: 18,
                bottom: 110,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: theme.colors.accent,
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
            }}
        >
            <Ionicons name={speakingVerse ? "stop" : "volume-high"} size={17} color={theme.colors.onAccent} />
            <Text style={{ color: theme.colors.onAccent, fontWeight: "700", fontSize: 14 }}>
                {speakingVerse ? `Verse ${speakingVerse}` : "Listen"}
            </Text>
        </TouchableOpacity>
        </View>
    );
}
