import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { useTheme } from "../../../../components/themes/theme";
import { searchAll } from "../../../../data/bible";
import Filters from "./Filters";
import SearchHeader from "./Header";
import ResultItem from "./ResultItem";

export default function SearchPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = {} as any;

    const [term, setTerm] = useState("");
    const [scope, setScope] = useState("all");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const doSearch = useCallback(async () => {
        if (!term || term.trim() === "") return;
        setSearching(true);
        const rows = await searchAll(term);
        // filter by scope simple rule
        let filtered = rows;
        if (scope === "ot") filtered = rows.filter(r => r.book && r.book !== "Mat" && r.book !== "Luk" && r.book !== "Jhn" && r.book !== "Rom");
        if (scope === "nt") filtered = rows.filter(r => r.book && (r.book === "Mat" || r.book === "Luk" || r.book === "Jhn" || r.book === "Rom"));
        setResults(filtered.slice(0, 200));
        setSearching(false);
    }, [term, scope]);

    const onSelect = (item: any) => {
        router.push(`/home/bible?book=${item.book}&chapter=${item.chapter}&verse=${item.verse}`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }}>
            <SearchHeader onBack={() => router.back()} theme={theme} />
            <View style={{ padding: 12 }}>
                <TextInput placeholder="Search scriptures" value={term} onChangeText={setTerm} onSubmitEditing={doSearch} style={{ padding: 10, borderRadius: 8, backgroundColor: theme.colors.bgSurface, color: theme.colors.textPrimary }} />
            </View>
            <Filters scope={scope} setScope={setScope} theme={theme} />
            {searching ? (
                <View style={{ padding: 12 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <View key={i} style={{ height: 48, backgroundColor: theme.colors.bgSurface, borderRadius: 8, marginBottom: 10 }} />
                    ))}
                </View>
            ) : (
                <FlatList data={results} keyExtractor={(i, idx) => `${i.book}-${i.chapter}-${i.verse}-${idx}`} renderItem={({ item }) => <ResultItem item={item} onPress={onSelect} theme={theme} highlight={term} />} />
            )}
        </View>
    );
}
