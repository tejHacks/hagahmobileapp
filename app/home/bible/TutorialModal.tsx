import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function TutorialModal({ visible, onClose, styles }: { visible: boolean; onClose: () => void; styles: any }) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.tutorialCard}>
                    <Text style={styles.strongsLemma}>How to use the Bible</Text>

                    <View style={styles.tutorialRow}>
                        <Ionicons name="link-outline" size={18} color="#8fbf8f" />
                        <Text style={styles.tutorialText}>
                            Bold-underlined words are Strong&apos;s words — tap them to see the original Hebrew/Greek and definition.
                        </Text>
                    </View>

                    <View style={styles.tutorialRow}>
                        <Ionicons name="swap-horizontal-outline" size={18} color="#8fbf8f" />
                        <Text style={styles.tutorialText}>
                            Swipe left or right anywhere on the page to move to the next or previous chapter.
                        </Text>
                    </View>

                    <View style={styles.tutorialRow}>
                        <Ionicons name="copy-outline" size={18} color="#8fbf8f" />
                        <Text style={styles.tutorialText}>
                            Tap a verse to select and highlight it, then hit Copy. Or long-press a verse to copy it instantly.
                        </Text>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.tutorialClose}>
                        <Text style={styles.navBtnText}>Got it</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
