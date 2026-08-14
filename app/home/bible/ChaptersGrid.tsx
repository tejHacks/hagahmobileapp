import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function ChaptersGrid({
  currentBookMeta,
  openChapter,
  prefetchChapter,
  selectedBookId,
  styles,
}: {
  currentBookMeta: any;
  openChapter: (n: number) => void;
  prefetchChapter: (id: string, n: number) => void;
  selectedBookId: string | null;
  styles: any;
}) {
  const chapterList = Array.from({ length: currentBookMeta.chapters }, (_, i) => i + 1);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.bookTitle}>{currentBookMeta.name}</Text>
      <Text style={styles.groupLabel}>SELECT A CHAPTER</Text>
      <View style={styles.chapterGrid}>
        {chapterList.map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.chapterChip}
            activeOpacity={0.8}
            onPress={() => openChapter(num)}
            onPressIn={() => selectedBookId && prefetchChapter(selectedBookId, num)}
          >
            <Text style={styles.chapterChipText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}
