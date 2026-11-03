import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useTheme } from "../../components/themes/theme";
import { searchAll } from "../../data/bible";
import Filters from "./bible/search/Filters";
import SearchHeader from "./bible/search/Header";
import ResultItem from "./bible/search/ResultItem";

// Correct 27-book NT id list matching build-bible-db.js output
// (note: Philippians is "Phl", not "Phi" — this was the source of a
// miscategorization bug in the OT/NT filter).
const NT_BOOKS = [
    "Mat", "Mar", "Luk", "Jhn", "Act", "Rom", "1Co", "2Co", "Gal", "Eph",
    "Phl", "Col", "1Th", "2Th", "1Ti", "2Ti", "Tit", "Phm", "Heb", "Jas",
    "1Pe", "2Pe", "1Jo", "2Jo", "3Jo", "Jde", "Rev",
];

type SearchResult = { book: string; chapter: number; verse: number; text: string };

export default function SearchPageRoot() {
    const router = useRouter();
    const { theme } = useTheme();

    const [term, setTerm] = useState("");
    const [scope, setScope] = useState<"all" | "ot" | "nt">("all");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const styles = useMemo(() => createStyles(theme), [theme]);

    // Runs the actual DB query — scope-agnostic, always fetches full results
    // and lets applyScope() below do the filtering.
    const runQuery = useCallback(async (searchTerm: string) => {
        if (!searchTerm || searchTerm.trim() === "") {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const rows = await searchAll(searchTerm);
            setResults(rows);
        } finally {
            setSearching(false);
        }
    }, []);

    const doSearch = useCallback(() => {
        runQuery(term);
    }, [term, runQuery]);

    // Apply OT/NT/ALL filter to whatever is currently in `results`.
    // This is derived, not stored separately, so switching scope never
    // needs a fresh DB hit and can never go stale.
    const filteredResults = useMemo(() => {
        if (scope === "ot") return results.filter((r) => !NT_BOOKS.includes(r.book));
        if (scope === "nt") return results.filter((r) => NT_BOOKS.includes(r.book));
        return results;
    }, [results, scope]);

    const onSelect = (item: SearchResult) => {
        router.replace(`/home/bible?book=${item.book}&chapter=${item.chapter}&verse=${item.verse}`);
    };

    // clear results when input is emptied — scope no longer needs its own
    // effect since filtering is derived via useMemo above, not re-fetched.
    React.useEffect(() => {
        if (!term || term.trim() === "") setResults([]);
    }, [term]);

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
                    data={filteredResults}
                    style={styles.results}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle={getIndicatorStyle(theme)}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
                    ListEmptyComponent={() => (
                        searching ? (
                            <View style={{ padding: 12 }}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <View key={i} style={{ height: 48, backgroundColor: theme.colors.bgSurface, borderRadius: 8, marginBottom: 10 }} />
                                ))}
                            </View>
                        ) : (
                            <View style={{ padding: 20 }}>
                                <Text style={{ color: theme.colors.textFaint }}>{term && term.trim() !== "" ? "No matches found." : "Type a term and press Search to find scriptures."}</Text>
                            </View>
                        )
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