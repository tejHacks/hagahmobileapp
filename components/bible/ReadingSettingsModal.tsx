import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Switch, Text, TouchableOpacity, View } from "react-native";
import type { Theme } from "../themes/theme";

export const FONT_SIZES = [15, 17, 19, 21, 24, 27];

export default function ReadingSettingsModal({
    visible,
    onClose,
    fontSize,
    setFontSize,
    showStrongs,
    setShowStrongs,
    onShowHelp,
    styles,
    theme,
}: {
    visible: boolean;
    onClose: () => void;
    fontSize: number;
    setFontSize: (v: number) => void;
    showStrongs: boolean;
    setShowStrongs: (v: boolean) => void;
    onShowHelp: () => void;
    styles: any;
    theme: Theme;
}) {
    const c = theme.colors;
    const idx = Math.max(0, FONT_SIZES.indexOf(fontSize));
    const canShrink = idx > 0;
    const canGrow = idx < FONT_SIZES.length - 1;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} onPress={onClose} />
                <View style={[styles.strongsCard, { maxWidth: 380, gap: 0 }]}>
                    <View style={styles.settingsHeader}>
                        <Text style={styles.settingsTitle}>Reading</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
                            <Ionicons name="close" size={20} color={c.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.settingsPreview, { fontSize, lineHeight: Math.round(fontSize * 1.72) }]}>
                        The LORD is my shepherd; I shall not want.
                    </Text>

                    <View style={styles.settingsRow}>
                        <Text style={styles.settingsLabel}>Text size</Text>
                        <View style={styles.stepper}>
                            <TouchableOpacity
                                style={[styles.stepperBtn, !canShrink && { opacity: 0.35 }]}
                                disabled={!canShrink}
                                onPress={() => setFontSize(FONT_SIZES[idx - 1])}
                                accessibilityLabel="Smaller text"
                            >
                                <Text style={[styles.stepperGlyph, { fontSize: 14 }]}>A</Text>
                            </TouchableOpacity>
                            <View style={styles.stepperDivider} />
                            <TouchableOpacity
                                style={[styles.stepperBtn, !canGrow && { opacity: 0.35 }]}
                                disabled={!canGrow}
                                onPress={() => setFontSize(FONT_SIZES[idx + 1])}
                                accessibilityLabel="Larger text"
                            >
                                <Text style={[styles.stepperGlyph, { fontSize: 20 }]}>A</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.settingsRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.settingsLabel}>Strong&apos;s study mode</Text>
                            <Text style={styles.settingsHint}>Underline words you can tap for the original Hebrew or Greek.</Text>
                        </View>
                        <Switch
                            value={showStrongs}
                            onValueChange={setShowStrongs}
                            trackColor={{ true: c.accent, false: c.bgSunken }}
                            thumbColor={c.bgElevated}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.settingsRow, { borderBottomWidth: 0 }]}
                        onPress={() => {
                            onClose();
                            onShowHelp();
                        }}
                    >
                        <Text style={styles.settingsLabel}>How to use the reader</Text>
                        <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
