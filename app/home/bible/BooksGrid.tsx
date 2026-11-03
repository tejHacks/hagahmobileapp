import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BibleBookMeta } from "../../../data/bible";

export default function BooksGrid({ books, openBook, prefetchBook, styles }: {
    books: BibleBookMeta[];
    openBook: (id: string) => void;
    prefetchBook: (id: string) => void;
    styles: any;
}) {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.groupLabel}>OLD TESTAMENT</Text>
            <View style={styles.bookCardGrid}>
                {books.slice(0, 39).map((b) => (
                    <TouchableOpacity
                        key={b.id}
                        style={styles.bookCard}
                        activeOpacity={0.85}
                        onPress={() => openBook(b.id)}
                        onPressIn={() => prefetchBook(b.id)}
                    >
                        <View style={styles.bookCardLeft}>
                            <Text style={styles.bookCardAbbrev}>{b.id}</Text>
                        </View>
                        <View style={styles.bookCardRight}>
                            <Text style={styles.bookCardName} numberOfLines={1}>{b.name}</Text>
                            <Text style={styles.bookCardMeta}>{b.chapters} chapters</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.groupLabel}>NEW TESTAMENT</Text>
            <View style={styles.bookCardGrid}>
                {books.slice(39).map((b) => (
                    <TouchableOpacity
                        key={b.id}
                        style={styles.bookCard}
                        activeOpacity={0.85}
                        onPress={() => openBook(b.id)}
                        onPressIn={() => prefetchBook(b.id)}
                    >
                        <View style={styles.bookCardLeft}>
                            <Text style={styles.bookCardAbbrev}>{b.id}</Text>
                        </View>
                        <View style={styles.bookCardRight}>
                            <Text style={styles.bookCardName} numberOfLines={1}>{b.name}</Text>
                            <Text style={styles.bookCardMeta}>{b.chapters} chapters</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 120 }} />
        </ScrollView>
    );
}
