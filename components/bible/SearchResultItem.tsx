import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { getBookMeta, plainVerseText } from "../../data/bible";
import { Theme } from "../themes/theme";

type SearchResult = { book: string; chapter: number; verse: number; text: string };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function SearchResultItem({ item, onPress, theme, highlight }: { item: SearchResult; onPress: (i: SearchResult) => void; theme: Theme; highlight: string }) {
    const text = plainVerseText(item.text);
    const terms = highlight.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
    const parts = terms.length ? text.split(new RegExp(`(${terms.join("|")})`, "ig")) : [text];
    const matches = new Set(terms.length ? highlight.trim().toLowerCase().split(/\s+/) : []);

    return (
        <TouchableOpacity onPress={() => onPress(item)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSubtle }}>
            <Text style={{ fontWeight: "700", fontSize: 13, letterSpacing: 0.3, color: theme.colors.accent, marginBottom: 4 }}>
                {getBookMeta(item.book)?.name ?? item.book} {item.chapter}:{item.verse}
            </Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 15, lineHeight: 23 }}>
                {parts.map((part, i) => (
                    <Text key={i} style={matches.has(part.toLowerCase()) ? { fontWeight: "700", color: theme.colors.accent } : undefined}>
                        {part}
                    </Text>
                ))}
            </Text>
        </TouchableOpacity>
    );
}
