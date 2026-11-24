import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SearchHeader({ title = "Search", onBack, theme }: any) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.bgBase }}>
            <TouchableOpacity onPress={onBack} style={{ paddingRight: 12 }}>
                <Ionicons name="chevron-back" size={22} color={theme.colors.accent} />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary }}>{title}</Text>
        </View>
    );
}
