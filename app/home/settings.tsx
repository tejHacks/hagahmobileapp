import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Navbar from "../../components/ui/Navbar";
import {
  requestNotificationPermission,
  scheduleDeclarationsForTimes,
  cancelAllDeclarations,
  getScheduledNotifications,
  AVAILABLE_TIMES,
} from "../../utils/notifications";
import { declarations } from "../../data/declarations";

const { width } = Dimensions.get("window");

function getDailyDeclaration() {
  const start = new Date("2025-01-01").getTime();
  const now = new Date().getTime();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return declarations[dayIndex % declarations.length];
}

const TIME_ICONS: Record<number, string> = {
  6: "sunny-outline",
  9: "partly-sunny-outline",
  12: "sunny",
  15: "cloudy-outline",
  18: "moon-outline",
};

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [selectedHours, setSelectedHours] = useState<number[]>([6]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const daily = getDailyDeclaration();

  useEffect(() => {
    (async () => {
      const scheduled = await getScheduledNotifications();
      if (scheduled.length > 0) {
        setNotificationsOn(true);
        const hours = scheduled
          .map((n) => n.content.data?.hour as number)
          .filter(Boolean);
        if (hours.length > 0) setSelectedHours(hours);
      }
    })();
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      setLoading(true);
      const granted = await requestNotificationPermission();
      setLoading(false);

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please allow notifications in your device settings to receive daily declarations.",
          [{ text: "OK" }]
        );
        return;
      }

      // Schedule with current selected hours immediately
      await scheduleDeclarationsForTimes(selectedHours);
      setNotificationsOn(true);
    } else {
      await cancelAllDeclarations();
      setNotificationsOn(false);
    }
  };

  const toggleHour = async (hour: number) => {
    let updated: number[];

    if (selectedHours.includes(hour)) {
      if (selectedHours.length === 1) {
        Alert.alert(
          "At least one time",
          "You need at least one reminder time selected.",
          [{ text: "Got it" }]
        );
        return;
      }
      updated = selectedHours.filter((h) => h !== hour);
    } else {
      updated = [...selectedHours, hour].sort((a, b) => a - b);
    }

    setSelectedHours(updated);

    if (notificationsOn) {
      setLoading(true);
      await scheduleDeclarationsForTimes(updated);
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = `${daily.ref}\n\n"${daily.scripture}"\n\n${daily.declaration}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const text = `✦ HAGAH — Daily Declaration\n\n${daily.ref}\n\n"${daily.scripture}"\n\n${daily.declaration}\n\n— Hagah App`;
    await Share.share({ message: text });
  };

  const activeLabels = AVAILABLE_TIMES.filter((t) =>
    selectedHours.includes(t.hour)
  ).map((t) => t.label);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#c9923a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's declaration */}
        <Text style={styles.sectionLabel}>TODAY'S DECLARATION</Text>
        <View style={styles.card}>
          <Text style={styles.declRef}>{daily.ref}</Text>
          <Text style={styles.declText} numberOfLines={3}>
            {daily.declaration}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, copied && styles.actionBtnActive]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={15}
                color={copied ? "#1a0f00" : "#c9923a"}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  copied && styles.actionBtnTextActive,
                ]}
              >
                {copied ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={15} color="#c9923a" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {/* Master toggle */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#c9923a"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Daily Reminders</Text>
                <Text style={styles.rowSub}>
                  Get reminded to declare every day
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#1a0f00", true: "#c9923a" }}
              thumbColor={notificationsOn ? "#f5d49a" : "#5a3e1b"}
              disabled={loading}
            />
          </View>

          <View style={styles.divider} />

          {/* Time picker — always visible, just disabled when notifs off */}
          <View style={styles.timeSection}>
            <View style={styles.timeSectionHeader}>
              <Ionicons name="alarm-outline" size={15} color="#c9923a" />
              <Text style={styles.timeSectionTitle}>Reminder Times</Text>
            </View>

            <Text style={styles.timeSectionSub}>
              {notificationsOn
                ? "Tap to toggle when you want to be reminded"
                : "Turn on reminders above to pick times"}
            </Text>

            {/* Time chips */}
            <View style={styles.timeGrid}>
              {AVAILABLE_TIMES.map((slot) => {
                const active =
                  notificationsOn && selectedHours.includes(slot.hour);
                const disabled = !notificationsOn;
                return (
                  <TouchableOpacity
                    key={slot.hour}
                    style={[
                      styles.timeChip,
                      active && styles.timeChipActive,
                      disabled && styles.timeChipDisabled,
                    ]}
                    onPress={() => toggleHour(slot.hour)}
                    activeOpacity={0.75}
                    disabled={disabled || loading}
                  >
                    <Ionicons
                      name={TIME_ICONS[slot.hour] as any}
                      size={14}
                      color={
                        disabled ? "#2d1800" : active ? "#1a0f00" : "#5a3e1b"
                      }
                    />
                    <Text
                      style={[
                        styles.timeChipText,
                        active && styles.timeChipTextActive,
                        disabled && styles.timeChipTextDisabled,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active summary */}
            {notificationsOn && selectedHours.length > 0 && (
              <View style={styles.summaryPill}>
                <Ionicons name="checkmark-circle" size={14} color="#c9923a" />
                <Text style={styles.summaryText}>
                  You'll be reminded at{" "}
                  <Text style={styles.summaryBold}>
                    {activeLabels.join(", ")}
                  </Text>{" "}
                  every day
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* App info */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          {[
            { key: "App Name", val: "Hagah" },
            { key: "Version", val: "1.0.0" },
            { key: "Declarations", val: "20 (more coming)" },
            { key: "Built with", val: "Faith & React Native" },
          ].map((item, i, arr) => (
            <React.Fragment key={item.key}>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>{item.key}</Text>
                <Text style={styles.infoVal}>{item.val}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Scripture */}
        <View style={styles.verseCard}>
          <Text style={styles.verseText}>
            "You shall <Text style={styles.verseBold}>hagah</Text> in it day
            and night, that you may observe to do according to all that is
            written in it. For then you will make your way prosperous."
          </Text>
          <Text style={styles.verseRef}>Joshua 1:8</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f00" },
  topBar: {
    width,
    backgroundColor: "#120900",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 146, 58, 0.15)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2d1800",
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c9923a",
    letterSpacing: 3,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  sectionLabel: {
    fontSize: 10,
    color: "#5a3e1b",
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#2d1800",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.15)",
    gap: 10,
  },
  declRef: {
    fontSize: 11,
    color: "#c9923a",
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  declText: {
    fontSize: 13,
    color: "rgba(245, 212, 154, 0.7)",
    lineHeight: 20,
    fontStyle: "italic",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(201, 146, 58, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  actionBtnActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  actionBtnText: {
    fontSize: 12,
    color: "#c9923a",
    fontWeight: "600",
  },
  actionBtnTextActive: {
    color: "#1a0f00",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    color: "#f5d49a",
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 11,
    color: "#5a3e1b",
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(201, 146, 58, 0.1)",
  },
  timeSection: {
    gap: 10,
  },
  timeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeSectionTitle: {
    fontSize: 13,
    color: "#f5d49a",
    fontWeight: "600",
  },
  timeSectionSub: {
    fontSize: 11,
    color: "#5a3e1b",
    lineHeight: 16,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a0f00",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  timeChipActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  timeChipDisabled: {
    backgroundColor: "#120900",
    borderColor: "rgba(201, 146, 58, 0.05)",
    opacity: 0.4,
  },
  timeChipText: {
    fontSize: 12,
    color: "#5a3e1b",
    fontWeight: "600",
  },
  timeChipTextActive: {
    color: "#1a0f00",
  },
  timeChipTextDisabled: {
    color: "#2d1800",
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "rgba(201, 146, 58, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  summaryText: {
    fontSize: 12,
    color: "rgba(201, 146, 58, 0.7)",
    lineHeight: 18,
    flex: 1,
  },
  summaryBold: {
    color: "#c9923a",
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoKey: {
    fontSize: 13,
    color: "rgba(245, 212, 154, 0.5)",
  },
  infoVal: {
    fontSize: 13,
    color: "#f5d49a",
    fontWeight: "600",
  },
  verseCard: {
    backgroundColor: "#120900",
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.1)",
    gap: 8,
  },
  verseText: {
    fontSize: 13,
    color: "rgba(201, 146, 58, 0.5)",
    fontStyle: "italic",
    lineHeight: 22,
    textAlign: "center",
  },
  verseBold: {
    color: "#c9923a",
    fontWeight: "700",
  },
  verseRef: {
    fontSize: 11,
    color: "#3d2500",
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
});