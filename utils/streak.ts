/**
 * Daily streak: a day counts when the user meditates on the declaration,
 * declares a scripture, or reads a Bible chapter. Days are stored as local
 * YYYY-MM-DD strings in AsyncStorage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const KEY = "hagah_streak_days";
const KEEP = 400; // days of history to keep

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Consecutive active days ending today, or ending yesterday if today is not done yet. */
export function currentStreak(days: Set<string>, today: Date = new Date()): number {
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** Longest run of consecutive active days ever recorded. */
export function bestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of sorted) {
    const [y, m, d] = k.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }
  return best;
}

/** The last 7 days, oldest first, as active/inactive. */
export function lastWeek(days: Set<string>, today: Date = new Date()): { key: string; label: string; active: boolean }[] {
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const key = dayKey(d);
    return { key, label: labels[d.getDay()], active: days.has(key) };
  });
}

async function load(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

type Listener = (days: Set<string>) => void;
const listeners = new Set<Listener>();

/** Record today as active. Safe to call many times a day. */
export async function markToday(): Promise<void> {
  const days = await load();
  const today = dayKey();
  if (days.has(today)) return;
  days.add(today);
  const trimmed = [...days].sort().slice(-KEEP);
  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  const next = new Set(trimmed);
  listeners.forEach((l) => l(next));
}

export function useStreak() {
  const [days, setDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    load().then((d) => alive && setDays(d));
    const l: Listener = (d) => setDays(d);
    listeners.add(l);
    return () => {
      alive = false;
      listeners.delete(l);
    };
  }, []);

  const mark = useCallback(() => markToday(), []);

  return {
    current: currentStreak(days),
    best: bestStreak(days),
    todayDone: days.has(dayKey()),
    week: lastWeek(days),
    mark,
  };
}
