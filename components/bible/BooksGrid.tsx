import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { bibleSections, getBookMeta } from "../../data/bible";
import type { Theme } from "../themes/theme";

type Testament = "ot" | "nt";

export default function BooksGrid({
    openBook,
    prefetchBook,
    lastPosition,
    onContinue,
    styles,
    theme,
}: {
    openBook: (id: string) => void;
    prefetchBook: (id: string) => void;
    lastPosition: { bookId: string; chapter: number } | null;
    onContinue: () => void;
    styles: any;
    theme: Theme;
}) {
    const lastBook = lastPosition ? getBookMeta(lastPosition.bookId) : undefined;
    const [testament, setTestament] = useState<Testament>(() =>
        lastBook && bibleSections.some((s) => s.testament === "nt" && s.books.includes(lastBook)) ? "nt" : "ot",
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {lastBook && lastPosition && (
                <TouchableOpacity style={styles.continueCard} activeOpacity={0.85} onPress={onContinue}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.continueEyebrow}>CONTINUE READING</Text>
                        <Text style={styles.continueTitle}>
                            {lastBook.name} {lastPosition.chapter}
                        </Text>
                    </View>
                    <View style={styles.continueArrow}>
                        <Ionicons name="arrow-forward" size={18} color={theme.colors.onAccent} />
                    </View>
                </TouchableOpacity>
            )}

            <View style={styles.segment}>
                {(["ot", "nt"] as Testament[]).map((t) => {
                    const active = testament === t;
                    return (
                        <TouchableOpacity
                            key={t}
                            style={[styles.segmentItem, active && styles.segmentItemActive]}
                            onPress={() => setTestament(t)}
                            activeOpacity={0.8}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                        >
                            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                {t === "ot" ? "Old Testament" : "New Testament"}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {bibleSections
                .filter((s) => s.testament === testament)
                .map((section) => (
                    <View key={section.title} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <View style={styles.sectionRule} />
                        </View>
                        <View style={styles.bookGrid}>
                            {section.books.map((b) => {
                                const isLast = lastPosition?.bookId === b.id;
                                return (
                                    <TouchableOpacity
                                        key={b.id}
                                        style={styles.bookCell}
                                        activeOpacity={0.6}
                                        onPress={() => openBook(b.id)}
                                        onPressIn={() => prefetchBook(b.id)}
                                    >
                                        <Text style={[styles.bookName, isLast && { color: theme.colors.accent }]} numberOfLines={1}>
                                            {b.name}
                                        </Text>
                                        <Text style={styles.bookMeta}>
                                            {b.chapters} {b.chapters === 1 ? "chapter" : "chapters"}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

            <View style={{ height: 150 }} />
        </ScrollView>
    );
}
