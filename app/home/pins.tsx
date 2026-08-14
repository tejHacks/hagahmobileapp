


import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../../components/ui/Navbar";
import { Theme, useTheme } from "../../components/themes/theme";
import { getBookmarks, removeBookmark, type Bookmark } from "../../utils/bookmarks";

export default function PinsScreen() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [pins, setPins] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const loadPins = useCallback(async () => {
        try {
            const savedPins = await getBookmarks();
            setPins(savedPins);
        } catch (error) {
            console.log("Load pins error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadPins();
    }, [loadPins]);

    const handleRemovePin = async (declarationId: number) => {
        try {
            await removeBookmark(declarationId);
            setPins((current) => current.filter((item) => item.declarationId !== declarationId));
        } catch (error) {
            console.log("Remove pin error:", error);
        }
    };

    const toggleExpanded = (pinId: number) => {
        setExpandedId((current) => (current === pinId ? null : pinId));
    };

    const formatSavedAt = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Saved recently";
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>SAVED</Text>
                    <Text style={styles.title}>Pins</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{pins.length}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); void loadPins(); }}
                            tintColor={theme.colors.accent}
                            colors={[theme.colors.accent]}
                        />
                    }
                >
                    {pins.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="bookmark-outline" size={34} color={theme.colors.accent} />
                            <Text style={styles.emptyTitle}>No saved pins yet</Text>
                            <Text style={styles.emptyText}>
                                Tap the bookmark icon on a declaration to keep it here for easy access.
                            </Text>
                        </View>
                    ) : (
                        pins.map((pin) => {
                            const isExpanded = expandedId === pin.id;

                            return (
                                <View key={pin.id} style={styles.card}>
                                    <TouchableOpacity
                                        style={styles.cardHeader}
                                        activeOpacity={0.85}
                                        onPress={() => toggleExpanded(pin.id)}
                                    >
                                        <View style={styles.refBlock}>
                                            <Text style={styles.refText}>{pin.ref}</Text>
                                            <Text style={styles.scriptureText} numberOfLines={isExpanded ? undefined : 2}>
                                                &quot;{pin.scripture}&quot;
                                            </Text>
                                        </View>

                                        <View style={styles.cardActions}>
                                            <View style={styles.expandBadge}>
                                                <Ionicons
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={16}
                                                    color={theme.colors.textPrimary}
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    void handleRemovePin(pin.declarationId);
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="close" size={16} color={theme.colors.textPrimary} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>

                                    {isExpanded ? (
                                        <View style={styles.expandedContent}>
                                            <Text style={styles.savedMeta}>Saved on {formatSavedAt(pin.createdAt)}</Text>
                                            <Text style={styles.declarationText}>{pin.declaration}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            );
                        })
                    )}

                    <View style={styles.spacer} />
                </ScrollView>
            )}

            <Navbar />
        </SafeAreaView>
    );
}

function createStyles(theme: Theme) {
    const c = theme.colors;
    return StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: c.bgBase,
        },
        header: {
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        eyebrow: {
            color: c.accent,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2.4,
            marginBottom: 4,
        },
        title: {
            color: c.textPrimary,
            fontSize: 28,
            fontWeight: "700",
        },
        countBadge: {
            backgroundColor: c.tint,
            borderColor: c.borderStrong,
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        countText: {
            color: c.textPrimary,
            fontSize: 14,
            fontWeight: "700",
        },
        scroll: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingBottom: 120,
        },
        loadingBox: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        emptyState: {
            backgroundColor: c.bgElevated,
            borderRadius: 20,
            padding: 24,
            marginTop: 8,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
        },
        emptyTitle: {
            marginTop: 10,
            color: c.textPrimary,
            fontSize: 18,
            fontWeight: "700",
        },
        emptyText: {
            marginTop: 8,
            color: c.textMuted,
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
        },
        card: {
            backgroundColor: c.bgElevated,
            borderRadius: 18,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: c.border,
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        refBlock: {
            flex: 1,
            paddingRight: 10,
        },
        refText: {
            color: c.accent,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.2,
        },
        cardActions: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        expandBadge: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.tint,
        },
        removeButton: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.tint,
        },
        expandedContent: {
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: c.borderSubtle,
            paddingTop: 12,
        },
        savedMeta: {
            color: c.textMuted,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 8,
        },
        scriptureText: {
            color: c.textPrimary,
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 22,
            marginBottom: 8,
        },
        declarationText: {
            color: c.textPrimary,
            fontSize: 14,
            lineHeight: 22,
        },
        spacer: {
            height: 24,
        },
    });
}