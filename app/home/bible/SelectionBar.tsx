import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SelectionBar({
    selectionRef,
    onCopy,
    onClose,
    styles,
    theme,
}: any) {
    return (
        <View style={styles.selectionBar}>
            <Text style={styles.selectionRef} numberOfLines={1}>{selectionRef}</Text>
            <View style={styles.selectionActions}>
                <TouchableOpacity style={styles.selectionBtn} onPress={onCopy}>
                    <Ionicons name="copy-outline" size={16} color={theme.colors.accent} />
                    <Text style={styles.selectionBtnText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectionBtn} onPress={onClose}>
                    <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
