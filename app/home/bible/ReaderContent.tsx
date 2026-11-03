import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { FlatList, Text, TouchableOpacity, View, findNodeHandle, LayoutChangeEvent } from "react-native";
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
    const verseRefs = useRef<Record<string, View | null>>({});
    const itemHeights = useRef<Record<string, number>>({});
    const averageHeight = useRef<number>(0);
    const headerHeight = useRef<number>(0);

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
                isSelected={selectedVerse === vNum}
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
            {...panHandlers}
        />
    );
}
