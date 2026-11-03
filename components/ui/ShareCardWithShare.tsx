import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useTheme } from "../themes/theme";
import ShareCard from "./ShareCard";

type Declaration = { text: string; reference?: string };

const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.olateju.hagahapp";

// Fixed: typed as an array of readonly 2-tuples so each entry structurally
// satisfies ShareCard's `readonly [string, string, ...string[]]` gradient
// prop. A plain `string[][]` only guarantees "some array of strings" with
// no minimum length, which is what TS was rejecting.
const DEFAULT_GRADIENTS: readonly (readonly [string, string])[] = [
    ["#5ee7df", "#b490ca"],
    ["#f6d365", "#fda085"],
    ["#84fab0", "#8fd3f4"],
    ["#cfd9df", "#e2ebf0"],
    ["#a1c4fd", "#c2e9fb"],
    ["#f093fb", "#f5576c"],
    ["#43e97b", "#38f9d7"],
    ["#667eea", "#764ba2"],
];

export default function ShareCardWithShare({
    declaration,
    image,
}: {
    declaration: Declaration;
    image?: any;
}) {
    const theme = useTheme().theme;
    const cardRef = useRef<View>(null);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);

    // Full caption — exactly what should travel with the image, built from
    // the CURRENT declaration only (not a hardcoded example).
    const buildCaption = () => {
        const scriptureLine = declaration.reference
            ? `${declaration.reference}\n\n`
            : "";

        return `✦ HAGAH\n\n${scriptureLine}Today's Declaration:\n${declaration.text}\n\nSpeak the Word. Shape your world.\n\nGet Hagah on Google Play:\n${PLAY_STORE_URL}`;
    };

    const share = async () => {
        setLoading(true);
        try {
            const uri = await captureRef(cardRef, { format: "png", quality: 1 });
            const caption = buildCaption();

            // Always have the caption on the clipboard as the reliable
            // fallback — share sheets don't guarantee text rides along
            // with an image (platform limitation, not an app bug).
            await Clipboard.setStringAsync(caption);

            try {
                // Best-effort: some targets (iOS Messages, Mail, etc.) DO
                // combine message + url into one share. Try it first.
                await Share.share({ message: caption, url: uri });
            } catch {
                // Rejected or unsupported combo — fall back to a pure
                // image share; caption is already on the clipboard above.
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, { dialogTitle: "Share Hagah card" });
                } else {
                    await Share.share({ message: caption });
                }
            }
        } catch (err) {
            console.warn("Failed to capture or share card", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.wrap}>
            <View ref={cardRef} collapsable={false}>
                <ShareCard
                    declaration={declaration}
                    image={image}
                    gradient={DEFAULT_GRADIENTS[selected]}
                />
            </View>

            <View style={styles.controls}>
                <View style={styles.swatches}>
                    {DEFAULT_GRADIENTS.map((g, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.swatch,
                                selected === i && { borderColor: theme.colors.accent, borderWidth: 2 },
                            ]}
                            activeOpacity={0.85}
                            onPress={() => setSelected(i)}
                        >
                            <View style={{ flex: 1, backgroundColor: g[0] }} />
                            <View style={{ flex: 1, backgroundColor: g[1] }} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.shareBtn, { backgroundColor: theme.colors.accent }]}
                    onPress={share}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.onAccent} />
                    ) : (
                        <Text style={[styles.shareText, { color: theme.colors.onAccent }]}>
                            Share Card
                        </Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.hint}>
                    Caption is copied to your clipboard — paste it if your share
                    target doesn&apos;t attach it automatically.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: "center", gap: 12 },
    controls: { width: "100%", paddingHorizontal: 20 },
    swatches: { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 12 },
    swatch: { width: 44, height: 44, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "transparent" },
    shareBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    shareText: { fontWeight: "700", letterSpacing: 1 },
    hint: { fontSize: 10, color: "#999", textAlign: "center", marginTop: 8, lineHeight: 15 },
});