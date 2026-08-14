import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BibleBook } from "../../data/bible";

export default function BooksGrid({ books, openBook, prefetchBook, styles }: {
    books: BibleBook[];
    openBook: (id: string) => void;
    prefetchBook: (id: string) => void;
    styles: any;
}) {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.groupLabel}>OLD TESTAMENT</Text>
            <View style={styles.bookGrid}>
                {books.slice(0, 39).map((b) => (
                    <TouchableOpacity
                        key={b.id}
                        style={styles.bookChip}
                        activeOpacity={0.8}
                        onPress={() => openBook(b.id)}
                        onPressIn={() => prefetchBook(b.id)}
                    >
                        <Text style={styles.bookChipText} numberOfLines={1}>{b.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.groupLabel}>NEW TESTAMENT</Text>
            <View style={styles.bookGrid}>
                {books.slice(39).map((b) => (
                    <TouchableOpacity
                        key={b.id}
                        style={styles.bookChip}
                        activeOpacity={0.8}
                        onPress={() => openBook(b.id)}
                        onPressIn={() => prefetchBook(b.id)}
                    >
                        <Text style={styles.bookChipText} numberOfLines={1}>{b.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 120 }} />
        </ScrollView>
    );
}
