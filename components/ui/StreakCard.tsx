import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useStreak } from "../../utils/streak";
import { useTheme, type Theme } from "../themes/theme";

/** Current streak, best streak and the last seven days. */
export default function StreakCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { current, best, todayDone, week } = useStreak();

  const headline = current === 0 ? "Start your streak today" : `${current}-day streak`;
  const sub = todayDone
    ? "Done for today. See you tomorrow."
    : current > 0
      ? "Meditate, declare or read today to keep it going."
      : "Meditate on today's declaration or read a chapter.";

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${headline}. Best streak ${best} days. ${sub}`}
    >
      <View style={styles.row}>
        <View style={[styles.flame, todayDone && styles.flameOn]}>
          <Ionicons name={todayDone ? "flame" : "flame-outline"} size={22} color={todayDone ? theme.colors.onAccent : theme.colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        <View style={styles.best}>
          <Text style={styles.bestValue}>{best}</Text>
          <Text style={styles.bestLabel}>BEST</Text>
        </View>
      </View>
      <View style={styles.week}>
        {week.map((d, i) => (
          <View key={d.key} style={styles.dayCol}>
            <View style={[styles.dot, d.active && styles.dotOn, i === 6 && !d.active && styles.dotToday]}>
              {d.active ? <Ionicons name="checkmark" size={12} color={theme.colors.onAccent} /> : null}
            </View>
            <Text style={[styles.dayLabel, i === 6 && styles.dayLabelToday]}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSubtle,
      padding: 16,
      gap: 14,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    flame: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
    },
    flameOn: { backgroundColor: c.accent, borderColor: c.accent },
    headline: { fontSize: 16, fontWeight: "700", color: c.textPrimary },
    sub: { fontSize: 13, color: c.textMuted, marginTop: 2 },
    best: { alignItems: "center", minWidth: 40 },
    bestValue: { fontSize: 18, fontWeight: "800", color: c.gold },
    bestLabel: { fontSize: 9, fontWeight: "700", color: c.textMuted, letterSpacing: 1.2 },
    week: { flexDirection: "row", justifyContent: "space-between" },
    dayCol: { alignItems: "center", gap: 6, flex: 1 },
    dot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.bgSunken,
      alignItems: "center",
      justifyContent: "center",
    },
    dotOn: { backgroundColor: c.accent },
    dotToday: { borderWidth: 1.5, borderColor: c.accent, backgroundColor: "transparent" },
    dayLabel: { fontSize: 11, color: c.textMuted, fontWeight: "600" },
    dayLabelToday: { color: c.textPrimary },
  });
}
