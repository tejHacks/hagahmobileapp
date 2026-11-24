import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../themes/theme";

const TIPS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: "hand-left-outline", text: "Tap a verse to select it, then copy or share it. Long-press a verse to copy it straight away." },
    { icon: "swap-horizontal-outline", text: "Swipe left for the next chapter and right for the previous one." },
    { icon: "volume-high-outline", text: "Tap Listen to hear the chapter read aloud. It starts from the verse you've selected." },
    { icon: "language-outline", text: "Turn on Strong's study mode under Aa. Underlined words open the original Hebrew or Greek." },
];

export default function TutorialModal({ visible, onClose, styles }: { visible: boolean; onClose: () => void; styles: any }) {
    const { theme } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.tutorialCard}>
                    <Text style={styles.settingsTitle}>Reading the Bible in Hagah</Text>
                    {TIPS.map((tip) => (
                        <View key={tip.icon} style={styles.tutorialRow}>
                            <Ionicons name={tip.icon} size={18} color={theme.colors.accent} />
                            <Text style={styles.tutorialText}>{tip.text}</Text>
                        </View>
                    ))}
                    <TouchableOpacity onPress={onClose} style={styles.tutorialClose}>
                        <Text style={styles.navBtnText}>Got it</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
