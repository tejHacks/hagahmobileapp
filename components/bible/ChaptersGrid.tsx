import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { BibleBookMeta } from "../../data/bible";

export default function ChaptersGrid({
  currentBookMeta,
  openChapter,
  prefetchChapter,
  lastChapter,
  styles,
}: {
  currentBookMeta: BibleBookMeta;
  openChapter: (n: number) => void;
  prefetchChapter: (id: string, n: number) => void;
  /** The chapter last read in this book, if any. */
  lastChapter: number | null;
  styles: any;
}) {
  const chapterList = Array.from({ length: currentBookMeta.chapters }, (_, i) => i + 1);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.bookTitle}>{currentBookMeta.name}</Text>
      <Text style={styles.bookSubtitle}>
        {currentBookMeta.chapters} {currentBookMeta.chapters === 1 ? "chapter" : "chapters"} · {currentBookMeta.versesLoaded.toLocaleString()} verses
      </Text>
      <View style={styles.chapterGrid}>
        {chapterList.map((num) => {
          const isLast = num === lastChapter;
          return (
            <TouchableOpacity
              key={num}
              style={[styles.chapterChip, isLast && styles.chapterChipActive]}
              activeOpacity={0.7}
              onPress={() => openChapter(num)}
              onPressIn={() => prefetchChapter(currentBookMeta.id, num)}
              accessibilityLabel={`Chapter ${num}${isLast ? ", last read" : ""}`}
            >
              <Text style={[styles.chapterChipText, isLast && styles.chapterChipTextActive]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: 150 }} />
    </ScrollView>
  );
}
