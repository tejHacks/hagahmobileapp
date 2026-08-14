import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../../../components/themes/theme";

export default function Header({
    leftLabel,
    onLeftPress,
    onHelpPress,
    title,
    theme,
    styles,
}: {
    leftLabel?: string;
    onLeftPress?: () => void;
    onHelpPress?: () => void;
    title?: string;
    theme: Theme;
    styles?: any;
}) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onLeftPress} hitSlop={12} style={styles.backRow}>
                <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
                <Text style={styles.backText}>{leftLabel ?? ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onHelpPress} hitSlop={10}>
                <Ionicons name="help-circle-outline" size={22} color={theme.colors.accent} />
            </TouchableOpacity>
        </View>
    );
}
