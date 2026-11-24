import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { Theme } from "../themes/theme";

export default function SelectionBar({
    selectionRef,
    onCopy,
    onShare,
    onClose,
    styles,
    theme,
}: {
    selectionRef: string;
    onCopy: () => void;
    onShare: () => void;
    onClose: () => void;
    styles: any;
    theme: Theme;
}) {
    return (
        <View style={styles.selectionBar}>
            <Text style={styles.selectionRef} numberOfLines={1}>{selectionRef}</Text>
            <View style={styles.selectionActions}>
                <TouchableOpacity style={styles.selectionBtn} onPress={onCopy} hitSlop={8}>
                    <Ionicons name="copy-outline" size={16} color={theme.colors.accent} />
                    <Text style={styles.selectionBtnText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectionBtn} onPress={onShare} hitSlop={8}>
                    <Ionicons name="share-outline" size={16} color={theme.colors.accent} />
                    <Text style={styles.selectionBtnText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectionBtn} onPress={onClose} hitSlop={8} accessibilityLabel="Clear selection">
                    <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
