import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    gradient: [string, string];
  }
> = {
  morning: {
    label: "Morning",
    icon: "sunny",
    suffix: "AM",
    gradient: ["#3D2000", "#241405"],
  },
  afternoon: {
    label: "Afternoon",
    icon: "partly-sunny",
    suffix: "PM",
    gradient: ["#2A1800", "#1a0f00"],
  },
  evening: {
    label: "Evening",
    icon: "moon",
    suffix: "PM",
    gradient: ["#120D1A", "#0d0700"],
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
          <LinearGradient
            colors={meta.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name={meta.icon} size={18} color="#c9923a" />
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
          </LinearGradient>

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
              <Ionicons name="checkmark" size={16} color="#1a0f00" />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 4, 0, 0.75)",
  },
  sheet: {
    backgroundColor: "#1a0f00",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(201, 146, 58, 0.2)",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(201, 146, 58, 0.15)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(201, 146, 58, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(201, 146, 58, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  periodLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f5d49a",
    letterSpacing: 0.5,
  },
  periodSuffix: {
    fontSize: 11,
    color: "rgba(201, 146, 58, 0.55)",
    letterSpacing: 1,
    marginTop: 2,
  },
  timePreview: {
    alignItems: "flex-end",
  },
  timeHour: {
    fontSize: 40,
    fontWeight: "800",
    color: "#c9923a",
    lineHeight: 44,
  },
  timeSuffix: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(201, 146, 58, 0.6)",
    letterSpacing: 1.5,
  },

  pickLabel: {
    fontSize: 10,
    color: "#5a3e1b",
    letterSpacing: 2.5,
    fontWeight: "700",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 14,
  },

  grid: {
    paddingHorizontal: 20,
    gap: 10,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
  },
  hourBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#2d1800",
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  hourBtnActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
    shadowColor: "#c9923a",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  hourText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5a3e1b",
  },
  hourTextActive: {
    color: "#1a0f00",
  },
  hourSuffixSmall: {
    fontSize: 8,
    color: "rgba(26, 15, 0, 0.7)",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#2d1800",
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    color: "#5a3e1b",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#c9923a",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 14,
    color: "#1a0f00",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});