import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Theme } from "../../../../components/themes/theme";

type SearchResult = { book: string; chapter: number; verse: number; text: string };

export default function ResultItem({ item, onPress, theme, highlight }: { item: SearchResult; onPress: (i: SearchResult) => void; theme: Theme; highlight: string }) {
    const rendered = item.text.split(new RegExp(`(${highlight})`, "ig")).map((part: string, i: number) => (
        <Text key={i} style={{ color: part.toLowerCase() === (highlight || "").toLowerCase() ? theme.colors.accent : theme.colors.textPrimary }}>{part}</Text>
    ));

    return (
        <TouchableOpacity onPress={() => onPress(item)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
            <Text style={{ fontWeight: "700", color: theme.colors.textPrimary }}>{item.book} {item.chapter}:{item.verse}</Text>
            <Text>{rendered}</Text>
        </TouchableOpacity>
    );
}
