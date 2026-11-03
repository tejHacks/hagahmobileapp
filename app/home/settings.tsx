

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Theme,
  ThemeName,
  themeOrder,
  themes,
  useTheme,
} from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import TimePickerModal, { type Period } from "../../components/ui/TimePickerModal";
import {
  cancelAllDeclarations,
  getScheduledNotifications,
  requestNotificationPermission,
  scheduleDeclarationsForPeriods,
  type ScheduledPeriod,
} from "../../utils/notifications";

// ─── helpers ─────────────────────────────────────────────────────────────────

function toHour24(chip: number, period: Period): number {
  if (period === "morning") return chip === 12 ? 0 : chip;
  return chip === 12 ? 12 : chip + 12;
}

function formatTime(chip: number, period: Period): string {
  const suffix = period === "morning" ? "AM" : "PM";
  return `${chip}:00 ${suffix}`;
}

const KEYS = {
  morningChip: "hagah_morning_chip",
  afternoonChip: "hagah_afternoon_chip",
  eveningChip: "hagah_evening_chip",
  notifsOn: "hagah_notifs_on",
};

// ─── component ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { theme, themeName, setThemeName } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [notificationsOn, setNotificationsOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [morningChip, setMorningChip] = useState(6);
  const [afternoonChip, setAfternoonChip] = useState(12);
  const [eveningChip, setEveningChip] = useState(6);

  const [modalOpen, setModalOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>("morning");

  useEffect(() => {
    (async () => {
      const [mc, ac, ec, no, scheduled] = await Promise.all([
        AsyncStorage.getItem(KEYS.morningChip),
        AsyncStorage.getItem(KEYS.afternoonChip),
        AsyncStorage.getItem(KEYS.eveningChip),
        AsyncStorage.getItem(KEYS.notifsOn),
        getScheduledNotifications(),
      ]);
      if (mc) setMorningChip(Number(mc));
      if (ac) setAfternoonChip(Number(ac));
      if (ec) setEveningChip(Number(ec));
      if (no === "true" && scheduled.length > 0) setNotificationsOn(true);
    })();
  }, []);

  function buildPeriods(mc = morningChip, ac = afternoonChip, ec = eveningChip): ScheduledPeriod[] {
    return [
      { period: "morning", hour: toHour24(mc, "morning"), minute: 0 },
      { period: "afternoon", hour: toHour24(ac, "afternoon"), minute: 0 },
      { period: "evening", hour: toHour24(ec, "evening"), minute: 0 },
    ];
  }

  const handleToggle = async (value: boolean) => {
    if (value) {
      setLoading(true);
      const granted = await requestNotificationPermission();
      setLoading(false);
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }
      await scheduleDeclarationsForPeriods(buildPeriods());
      setNotificationsOn(true);
      await AsyncStorage.setItem(KEYS.notifsOn, "true");
    } else {
      await cancelAllDeclarations();
      setNotificationsOn(false);
      await AsyncStorage.setItem(KEYS.notifsOn, "false");
    }
  };

  const openPicker = (period: Period) => {
    if (!notificationsOn) return;
    setActivePeriod(period);
    setModalOpen(true);
  };

  const handleConfirm = async (chip: number) => {
    let newMc = morningChip;
    let newAc = afternoonChip;
    let newEc = eveningChip;

    if (activePeriod === "morning") {
      setMorningChip(chip); newMc = chip;
      await AsyncStorage.setItem(KEYS.morningChip, String(chip));
    } else if (activePeriod === "afternoon") {
      setAfternoonChip(chip); newAc = chip;
      await AsyncStorage.setItem(KEYS.afternoonChip, String(chip));
    } else {
      setEveningChip(chip); newEc = chip;
      await AsyncStorage.setItem(KEYS.eveningChip, String(chip));
    }

    if (notificationsOn) {
      setLoading(true);
      await scheduleDeclarationsForPeriods(buildPeriods(newMc, newAc, newEc));
      setLoading(false);
    }
  };

  const currentChip =
    activePeriod === "morning" ? morningChip
      : activePeriod === "afternoon" ? afternoonChip
        : eveningChip;

  const PeriodRow = ({
    period, label, icon, chip, isFirst,
  }: {
    period: Period; label: string;
    icon: keyof typeof Ionicons.glyphMap;
    chip: number; isFirst?: boolean;
  }) => {
    const disabled = !notificationsOn;
    return (
      <>
        {!isFirst && <View style={styles.divider} />}
        <TouchableOpacity
          style={[styles.periodRow, disabled && styles.periodRowDisabled]}
          onPress={() => openPicker(period)}
          activeOpacity={disabled ? 1 : 0.7}
          disabled={disabled || loading}
        >
          <View style={[styles.periodIconWrap, disabled && styles.periodIconWrapDim]}>
            <Ionicons name={icon} size={16} color={disabled ? theme.colors.textDisabled : theme.colors.accent} />
          </View>
          <Text style={[styles.periodLabel, disabled && styles.dimText]}>{label}</Text>
          <View style={styles.periodTimeWrap}>
            <Text style={[styles.periodTime, disabled && styles.dimText]}>
              {formatTime(chip, period)}
            </Text>
            {!disabled && (
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textFaint} />
            )}
          </View>
        </TouchableOpacity>
      </>
    );
  };

  // ── theme swatch, previews the TARGET theme's own colors, not the active one ──
  const ThemeSwatch = ({ name }: { name: ThemeName }) => {
    const t = themes[name];
    const isActive = themeName === name;
    return (
      <TouchableOpacity
        style={styles.themeSwatch}
        activeOpacity={0.8}
        onPress={() => setThemeName(name)}
      >
        <View
          style={[
            styles.themeSwatchPreview,
            {
              backgroundColor: t.colors.bgBase,
              borderColor: isActive ? theme.colors.accent : "transparent",
            },
          ]}
        >
          <View style={[styles.themeSwatchDot, { backgroundColor: t.colors.accent }]} />
          <View
            style={[
              styles.themeSwatchBar,
              { backgroundColor: t.colors.textPrimary, opacity: 0.5 },
            ]}
          />
          {isActive && (
            <View style={styles.themeSwatchCheck}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
            </View>
          )}
        </View>
        <Text
          style={[
            styles.themeSwatchLabel,
            isActive && { color: theme.colors.textPrimary, fontWeight: "700" },
          ]}
          numberOfLines={1}
        >
          {t.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* APPEARANCE */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          <Text style={styles.themesIntro}>Choose the look and feel of Hagah.</Text>
          <View style={styles.themesGrid}>
            {themeOrder.map((name) => (
              <ThemeSwatch key={name} name={name} />
            ))}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Ionicons name="notifications-outline" size={17} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Daily Reminders</Text>
                <Text style={styles.toggleSub}>
                  {notificationsOn ? "Reminders are active" : "Tap to enable declarations"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={handleToggle}
              trackColor={{ false: theme.colors.bgBase, true: theme.colors.accent }}
              thumbColor={notificationsOn ? theme.colors.textPrimary : theme.colors.textFaint}
              disabled={loading}
            />
          </View>

          <View style={styles.divider} />

          {!notificationsOn && (
            <Text style={styles.disabledHint}>
              Enable reminders above to set your times
            </Text>
          )}

          <PeriodRow period="morning" label="Morning" icon="sunny-outline" chip={morningChip} isFirst />
          <PeriodRow period="afternoon" label="Afternoon" icon="partly-sunny-outline" chip={afternoonChip} />
          <PeriodRow period="evening" label="Evening" icon="moon-outline" chip={eveningChip} />

          {notificationsOn && (
            <View style={styles.summaryPill}>
              <Ionicons name="checkmark-circle" size={13} color={theme.colors.accent} />
              <Text style={styles.summaryText}>
                {"Reminding you at "}
                <Text style={styles.summaryBold}>
                  {`${formatTime(morningChip, "morning")}, ${formatTime(afternoonChip, "afternoon")}, ${formatTime(eveningChip, "evening")}`}
                </Text>
                {" daily"}
              </Text>
            </View>
          )}
        </View>

        {/* SUPPORT */}
        {/*<Text style={styles.sectionLabel}>SUPPORT HAGAH</Text>*/}
        {/*<TouchableOpacity
          style={styles.supportCard}
          activeOpacity={0.85}
          onPress={() => Linking.openURL("https://buymeacoffee.com/tejuhacks")}
        >
          <View style={styles.supportGlow} />
          <View style={styles.supportContent}>
            <Text style={styles.supportHebrew}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Support Our Work</Text>
              <Text style={styles.supportSub}>
                Hagah is built with faith and late nights. If it's been a
                blessing, consider giving so we can keep building.
              </Text>
            </View>
          </View>
          <View style={styles.supportFooter}>
            <Text style={styles.supportCta}>GIVE NOW</Text>
            <Ionicons name="heart" size={13} color={theme.colors.onAccent} />
          </View>
        </TouchableOpacity>*/}

        {/* FEEDBACK */}
        <Text style={styles.sectionLabel}>FEEDBACK</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.feedbackRow}
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL("mailto:olateju202@gmail.com?subject=Hagah%20Feedback&body=Hi%20Olateju%2C%0A%0A")
            }
          >
            <View style={styles.feedbackIcon}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Send Feedback</Text>
              <Text style={styles.feedbackSub}>olateju202@gmail.com</Text>
            </View>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.textFaint} />
          </TouchableOpacity>

          <View style={styles.divider} />
          {/*
          <TouchableOpacity
            style={styles.feedbackRow}
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL("https://play.google.com/store/apps/details?id=com.tejuhacks.hagah")
            }
          >
            <View style={styles.feedbackIcon}>
              <Ionicons name="star-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Rate on Play Store</Text>
              <Text style={styles.feedbackSub}>A review means the world to us</Text>
            </View>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.textFaint} />
          </TouchableOpacity>*/}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.feedbackRow}
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL("mailto:olateju202@gmail.com?subject=Hagah%20Suggestion&body=Hi%2C%20I%20have%20a%20suggestion%3A%0A%0A")
            }
          >
            <View style={styles.feedbackIcon}>
              <Ionicons name="bulb-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Send a Suggestion</Text>
              <Text style={styles.feedbackSub}>Got an idea? We&apos;re listening</Text>
            </View>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.textFaint} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.feedbackRow}
            activeOpacity={0.8}
            onPress={() => router.push("/home/about")}
          >
            <View style={styles.feedbackIcon}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>About Hagah</Text>
              <Text style={styles.feedbackSub}>Read about Hagah and how it works</Text>
            </View>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* Verse footer */}
        <View style={styles.verseCard}>
          <Text style={styles.verseText}>
            {"\"This book of the law shall not depart out of thy mouth; but thou shalt "}
            <Text style={styles.verseBold}>hagah</Text>
            {" therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.\""}
          </Text>
          <Text style={styles.verseRef}>Joshua 1:8</Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <TimePickerModal
        visible={modalOpen}
        period={activePeriod}
        currentChip={currentChip}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />

      <Navbar />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgBase },

    topBar: {
      backgroundColor: c.bgSunken,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      paddingHorizontal: 22,
      paddingVertical: 18,
    },
    topTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: c.accent,
      letterSpacing: 4,
    },

    scroll: { paddingHorizontal: 20, paddingTop: 22, gap: 10 },

    sectionLabel: {
      fontSize: 9,
      color: c.textDisabled,
      letterSpacing: 2.5,
      fontWeight: "700",
      marginBottom: 6,
      marginTop: 10,
      paddingHorizontal: 4,
    },

    card: {
      backgroundColor: c.bgSurface,
      borderRadius: 18,
      paddingHorizontal: 18,
      paddingVertical: 6,
      borderWidth: 0.5,
      borderColor: c.borderSubtle,
    },

    divider: {
      height: 0.5,
      backgroundColor: c.borderSubtle,
    },

    // ── Appearance / theme swatches ─────────────────────────────────────────
    themesIntro: {
      fontSize: 12,
      color: c.textFaint,
      paddingTop: 14,
      paddingBottom: 4,
    },
    themesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
      paddingVertical: 14,
    },
    themeSwatch: {
      width: 84,
      alignItems: "center",
      gap: 7,
    },
    themeSwatchPreview: {
      width: 64,
      height: 64,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    themeSwatchDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    themeSwatchBar: {
      width: 30,
      height: 4,
      borderRadius: 2,
    },
    themeSwatchCheck: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: c.bgSurface,
      borderRadius: 9,
    },
    themeSwatchLabel: {
      fontSize: 11,
      color: c.textFaint,
      fontWeight: "600",
      textAlign: "center",
    },

    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      gap: 12,
    },
    toggleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      flex: 1,
    },
    toggleIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.tint,
      borderWidth: 0.5,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleTitle: {
      fontSize: 15,
      color: c.textPrimary,
      fontWeight: "600",
    },
    toggleSub: {
      fontSize: 11,
      color: c.textFaint,
      marginTop: 2,
    },

    disabledHint: {
      fontSize: 11,
      color: c.textDisabled,
      paddingVertical: 12,
      paddingHorizontal: 2,
      fontStyle: "italic",
    },

    periodRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      gap: 14,
    },
    periodRowDisabled: { opacity: 0.4 },
    periodIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.tint,
      borderWidth: 0.5,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    periodIconWrapDim: {
      backgroundColor: "transparent",
      borderColor: c.borderSubtle,
    },
    periodLabel: {
      flex: 1,
      fontSize: 14,
      color: c.textPrimary,
      fontWeight: "500",
    },
    periodTimeWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    periodTime: {
      fontSize: 14,
      color: c.accent,
      fontWeight: "700",
    },
    dimText: { color: c.textDisabled },

    summaryPill: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: c.tint,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 0.5,
      borderColor: c.borderSubtle,
      marginTop: 4,
      marginBottom: 6,
    },
    summaryText: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 18,
      flex: 1,
    },
    summaryBold: { color: c.accent, fontWeight: "700" },

    supportCard: {
      backgroundColor: c.bgElevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.borderStrong,
      overflow: "hidden",
    },
    supportGlow: {
      position: "absolute",
      top: -20,
      right: -20,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.accent,
      opacity: 0.07,
    },
    supportContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      padding: 20,
      paddingBottom: 14,
    },
    supportHebrew: { fontSize: 22, color: c.accent, lineHeight: 28 },
    supportTitle: {
      fontSize: 16,
      color: c.textPrimary,
      fontWeight: "700",
      marginBottom: 5,
    },
    supportSub: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 18,
    },
    supportFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.accent,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      paddingVertical: 13,
    },
    supportCta: {
      fontSize: 13,
      color: c.onAccent,
      fontWeight: "800",
      letterSpacing: 1.5,
    },

    feedbackRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 14,
    },
    feedbackIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.tint,
      borderWidth: 0.5,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    feedbackTitle: { fontSize: 14, color: c.textPrimary, fontWeight: "500" },
    feedbackSub: { fontSize: 11, color: c.textFaint, marginTop: 2 },

    verseCard: {
      backgroundColor: c.bgSunken,
      borderRadius: 14,
      padding: 22,
      borderWidth: 0.5,
      borderColor: c.borderSubtle,
      gap: 8,
      marginTop: 6,
    },
    verseText: {
      fontSize: 12,
      color: c.textFaint,
      fontStyle: "italic",
      lineHeight: 21,
      textAlign: "center",
    },
    verseBold: { color: c.accent, fontWeight: "700" },
    verseRef: {
      fontSize: 10,
      color: c.textDisabled,
      letterSpacing: 2,
      textAlign: "center",
      textTransform: "uppercase",
    },
  });
}