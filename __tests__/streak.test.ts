import AsyncStorage from "@react-native-async-storage/async-storage";
import { bestStreak, currentStreak, dayKey, lastWeek, markToday } from "../utils/streak";

const d = (s: string) => {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day, 12);
};
const days = (...keys: string[]) => new Set(keys);

describe("current streak", () => {
  it("counts consecutive days ending today", () => {
    expect(currentStreak(days("2026-11-21", "2026-11-22", "2026-11-23"), d("2026-11-23"))).toBe(3);
  });

  it("is still alive if today is not done yet but yesterday was", () => {
    expect(currentStreak(days("2026-11-21", "2026-11-22"), d("2026-11-23"))).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(currentStreak(days("2026-11-19", "2026-11-20"), d("2026-11-23"))).toBe(0);
  });

  it("crosses month boundaries", () => {
    expect(currentStreak(days("2026-10-31", "2026-11-01"), d("2026-11-01"))).toBe(2);
  });
});

it("best streak finds the longest run", () => {
  expect(bestStreak(days("2026-01-01", "2026-01-02", "2026-01-03", "2026-02-10", "2026-02-11"))).toBe(3);
  expect(bestStreak(days())).toBe(0);
});

it("last week lists seven days ending today", () => {
  const week = lastWeek(days("2026-11-23", "2026-11-20"), d("2026-11-23"));
  expect(week).toHaveLength(7);
  expect(week[6]).toMatchObject({ key: "2026-11-23", active: true, label: "M" });
  expect(week.filter((x) => x.active)).toHaveLength(2);
});

it("marking today is stored once", async () => {
  await AsyncStorage.clear();
  await markToday();
  await markToday();
  const saved = JSON.parse((await AsyncStorage.getItem("hagah_streak_days")) ?? "[]");
  expect(saved).toEqual([dayKey()]);
});
