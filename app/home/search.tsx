import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useTheme } from "../../components/themes/theme";
import { searchAll } from "../../data/bible";
import Filters from "./bible/search/Filters";
import SearchHeader from "./bible/search/Header";
import ResultItem from "./bible/search/ResultItem";

export default function SearchPageRoot() {
    const router = useRouter();
    const { theme } = useTheme();

    const [term, setTerm] = useState("");
    const [scope, setScope] = useState<"all" | "ot" | "nt">("all");
    type SearchResult = { book: string; chapter: number; verse: number; text: string };
    const [results, setResults] = useState<SearchResult[]>([]);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const doSearch = useCallback(async () => {
        if (!term || term.trim() === "") return;
        const rows = await searchAll(term);
        let filtered = rows;
        // TODO: replace with real OT/NT book lists
        const nt = ["Mat", "Mar", "Luk", "Jhn", "Act", "Rom", "1Co", "2Co", "Gal", "Eph", "Phi", "Col", "1Th", "2Th", "1Ti", "2Ti", "Tit", "Phm", "Heb", "Jas", "1Pe", "2Pe", "1Jo", "2Jo", "3Jo", "Jde", "Rev"];
        if (scope === "ot") filtered = rows.filter(r => !nt.includes(r.book));
        if (scope === "nt") filtered = rows.filter(r => nt.includes(r.book));
        setResults(filtered.slice(0, 500));
    }, [term, scope]);

    const onSelect = (item: SearchResult) => {
        // use replace so we don't stack many bible routes in history and to
        // ensure params are applied immediately
        router.replace(`/home/bible?book=${item.book}&chapter=${item.chapter}&verse=${item.verse}`);
    };

    // clear results when input is emptied
    React.useEffect(() => {
        if (!term || term.trim() === "") setResults([]);
    }, [term]);

    // clear results when scope changes to keep UI clean
    React.useEffect(() => {
        setResults([]);
    }, [scope]);

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={80}>
                <SearchHeader onBack={() => router.back()} theme={theme} />

                <View style={styles.searchRow}>
                    <TextInput
                        placeholder="Search scriptures"
                        placeholderTextColor={theme.colors.textFaint}
                        value={term}
                        onChangeText={setTerm}
                        onSubmitEditing={doSearch}
                        returnKeyType="search"
                        style={styles.input}
                    />
                </View>

                <Filters scope={scope} setScope={setScope} theme={theme} />

                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={results}
                    style={styles.results}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle={getIndicatorStyle(theme)}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: theme.colors.textFaint }}>{term && term.trim() !== "" ? "No matches found." : "Type a term and press Search to find scriptures."}</Text>
                        </View>
                    )}
                    keyExtractor={(i, idx) => `${i.book}-${i.chapter}-${i.verse}-${idx}`}
                    renderItem={({ item }) => <ResultItem item={item} onPress={onSelect} theme={theme} highlight={term} />}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(theme: Theme) {
    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.colors.bgBase },
        container: { flex: 1 },
        searchRow: { padding: 12 },
        input: { padding: 12, borderRadius: 10, backgroundColor: theme.colors.bgSurface, color: theme.colors.textPrimary, fontSize: 16 },
        results: { flex: 1 },
    });
}

function getIndicatorStyle(theme: Theme): "black" | "white" {
    try {
        const bg = (theme.colors?.bgBase || "#ffffff").replace("#", "");
        const hex = bg.length === 3 ? bg.split("").map((h: string) => h + h).join("") : bg;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return lum < 128 ? "white" : "black";
    } catch {
        return "black";
    }
}
