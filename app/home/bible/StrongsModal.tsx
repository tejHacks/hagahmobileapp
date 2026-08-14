import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { strongsLanguageLabel, type StrongsEntry } from "../../../utils/strongs";

export default function StrongsModal({
    strongsModal,
    visible,
    onClose,
    copyStrongsEntry,
    styles,
    theme,
}: {
    strongsModal: { code: string; entry: StrongsEntry | null } | null;
    visible: boolean;
    onClose: () => void;
    copyStrongsEntry: () => void;
    styles: any;
    theme: any;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} onPress={onClose} />
                <View style={styles.strongsCard}>
                    {strongsModal && (
                        <View>
                            <View style={styles.strongsHeaderRow}>
                                <Text style={styles.strongsCode}>{strongsModal.code}</Text>
                                <Text style={styles.strongsLang}>{strongsLanguageLabel(strongsModal.code)}</Text>
                                {strongsModal.entry && (
                                    <TouchableOpacity onPress={copyStrongsEntry} hitSlop={10} style={{ marginRight: 4 }}>
                                        <Ionicons name="copy-outline" size={18} color={theme.colors.accent} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={onClose} hitSlop={10}>
                                    <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={{ maxHeight: Dimensions.get("window").height * 0.72 }}
                                contentContainerStyle={{ paddingBottom: 6 }}
                                nestedScrollEnabled
                            >
                                {strongsModal.entry ? (
                                    <View>
                                        {strongsModal.entry.lemma && (
                                            <Text style={styles.strongsLemma}>{strongsModal.entry.lemma}</Text>
                                        )}
                                        {strongsModal.entry.xlit && (
                                            <Text style={styles.strongsXlit}>
                                                {strongsModal.entry.xlit}
                                                {strongsModal.entry.pron ? ` · ${strongsModal.entry.pron}` : ""}
                                            </Text>
                                        )}
                                        {strongsModal.entry.def && (
                                            <>
                                                <Text style={styles.strongsSectionLabel}>DEFINITION</Text>
                                                <Text style={styles.strongsBody}>{strongsModal.entry.def}</Text>
                                            </>
                                        )}
                                        {strongsModal.entry.kjv && (
                                            <>
                                                <Text style={styles.strongsSectionLabel}>KJV TRANSLATES AS</Text>
                                                <Text style={styles.strongsBody}>{strongsModal.entry.kjv}</Text>
                                            </>
                                        )}
                                        {strongsModal.entry.deriv && (
                                            <>
                                                <Text style={styles.strongsSectionLabel}>DERIVATION</Text>
                                                <Text style={styles.strongsBody}>{strongsModal.entry.deriv}</Text>
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.strongsBody}>No entry found for this number.</Text>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
