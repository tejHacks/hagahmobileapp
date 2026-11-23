import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme, type Theme } from "../themes/theme";

export type Period = "morning" | "afternoon" | "evening";

interface TimePickerModalProps {
  visible: boolean;
  period: Period;
  currentChip: number;
  onConfirm: (chip: number) => void;
  onClose: () => void;
}

const PERIOD_META: Record<
  Period,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    suffix: string;
  }
> = {
  morning: {
    label: "Morning",
    icon: "sunny",
    suffix: "AM",
  },
  afternoon: {
    label: "Afternoon",
    icon: "partly-sunny",
    suffix: "PM",
  },
  evening: {
    label: "Evening",
    icon: "moon",
    suffix: "PM",
  },
};

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const GRID_COLS = 4;

export default function TimePickerModal({
  visible,
  period,
  currentChip,
  onConfirm,
  onClose,
}: TimePickerModalProps) {
  const [selected, setSelected] = useState(currentChip);
  const meta = PERIOD_META[period];
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Sync when modal opens
  useEffect(() => {
    if (visible) setSelected(currentChip);
  }, [visible, currentChip]);

  const rows: number[][] = [];
  for (let i = 0; i < HOURS.length; i += GRID_COLS) {
    rows.push(HOURS.slice(i, i + GRID_COLS));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name={meta.icon} size={18} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.periodLabel}>{meta.label}</Text>
                <Text style={styles.periodSuffix}>{meta.suffix} reminder</Text>
              </View>
            </View>

            {/* Large time preview */}
            <View style={styles.timePreview}>
              <Text style={styles.timeHour}>{selected}</Text>
              <Text style={styles.timeSuffix}>{meta.suffix}</Text>
            </View>
          </View>

          {/* Pick a time label */}
          <Text style={styles.pickLabel}>PICK A TIME</Text>

          {/* Hour grid */}
          <View style={styles.grid}>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.gridRow}>
                {row.map((chip) => {
                  const isActive = chip === selected;
                  return (
                    <TouchableOpacity
                      key={chip}
                      style={[styles.hourBtn, isActive && styles.hourBtnActive]}
                      onPress={() => setSelected(chip)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          isActive && styles.hourTextActive,
                        ]}
                      >
                        {chip}
                      </Text>
                      {isActive && (
                        <Text style={styles.hourSuffixSmall}>{meta.suffix}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onConfirm(selected);
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.onAccent} />
              <Text style={styles.confirmText}>Set Time</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom safe spacing */}
          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: c.overlay },
    sheet: {
      backgroundColor: c.bgElevated,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 22,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderSubtle,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    periodLabel: { fontSize: 18, fontWeight: "700", color: c.textPrimary, letterSpacing: 0.3 },
    periodSuffix: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    timePreview: { alignItems: "flex-end" },
    timeHour: { fontSize: 40, fontWeight: "800", color: c.accent, lineHeight: 44 },
    timeSuffix: { fontSize: 12, fontWeight: "700", color: c.textMuted, letterSpacing: 1.5 },
    pickLabel: { fontSize: 11, color: c.textMuted, letterSpacing: 2.5, fontWeight: "700", paddingHorizontal: 24, paddingTop: 22, paddingBottom: 14 },
    grid: { paddingHorizontal: 20, gap: 10 },
    gridRow: { flexDirection: "row", gap: 10 },
    hourBtn: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 16,
      backgroundColor: c.bgSunken,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    hourBtnActive: { backgroundColor: c.accent, borderColor: c.accent },
    hourText: { fontSize: 18, fontWeight: "700", color: c.textSecondary },
    hourTextActive: { color: c.onAccent },
    hourSuffixSmall: { fontSize: 9, color: c.onAccent, fontWeight: "700", letterSpacing: 0.5, marginTop: 1, opacity: 0.8 },
    actions: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 22 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: c.bgSunken,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSubtle,
      alignItems: "center",
    },
    cancelText: { fontSize: 14, color: c.textSecondary, fontWeight: "600" },
    confirmBtn: {
      flex: 2,
      flexDirection: "row",
      gap: 8,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmText: { fontSize: 14, color: c.onAccent, fontWeight: "800", letterSpacing: 0.3 },
  });
}
