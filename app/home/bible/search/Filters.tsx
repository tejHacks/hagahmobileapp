import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../../../../components/themes/theme";

export default function Filters({ scope, setScope, theme }: { scope: "all" | "ot" | "nt"; setScope: (s: "all" | "ot" | "nt") => void; theme: Theme }) {
    return (
        <View style={{ flexDirection: "row", padding: 12, gap: 8 }}>
            {[
                { key: "all", label: "All" },
                { key: "ot", label: "OT" },
                { key: "nt", label: "NT" },
            ].map((f) => (
                <TouchableOpacity key={f.key} onPress={() => setScope(f.key as "all" | "ot" | "nt")} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: scope === f.key ? theme.colors.tint : theme.colors.bgSurface }}>
                    <Text style={{ color: scope === f.key ? theme.colors.accent : theme.colors.textPrimary }}>{f.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}
