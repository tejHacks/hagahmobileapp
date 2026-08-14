import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function FontSettingsModal({ visible, onClose, fontSize, setFontSize, styles, theme }: any) {
    const options = [14, 16, 18, 20, 22];
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.strongsCard, { maxWidth: 360 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={{ fontWeight: "800", color: theme.colors.textPrimary }}>Reading Settings</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: theme.colors.textFaint, marginBottom: 8 }}>Font size</Text>
                    {options.map((o) => (
                        <TouchableOpacity key={o} onPress={() => setFontSize(o)} style={{ paddingVertical: 8 }}>
                            <Text style={{ fontWeight: fontSize === o ? "800" : "400", color: theme.colors.textPrimary }}>{o}</Text>
                        </TouchableOpacity>
                    ))}

                    <View style={{ marginTop: 12, alignItems: "flex-end" }}>
                        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                            <Text style={{ color: theme.colors.accent }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
