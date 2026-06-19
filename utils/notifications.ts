import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const AVAILABLE_TIMES = [
  { label: "6:00 AM", hour: 6, minute: 0 },
  { label: "9:00 AM", hour: 9, minute: 0 },
  { label: "12:00 PM", hour: 12, minute: 0 },
  { label: "3:00 PM", hour: 15, minute: 0 },
  { label: "6:00 PM", hour: 18, minute: 0 },
];

export type TimeSlot = (typeof AVAILABLE_TIMES)[number];

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("hagah-declarations", {
      name: "Daily Declarations",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDeclarationsForTimes(
  selectedHours: number[],
): Promise<string[]> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return [];

    await cancelAllDeclarations();

    const messages = [
      "Open Hagah and speak the Word over your day. הגה",
      "Your midday declaration is ready. Rise and declare! הגה",
      "Speak the Word. It is working for you right now. הגה",
      "Your afternoon declaration awaits. Don't let it pass. הגה",
      "End your day with the Word on your lips. הגה",
    ];

    const ids: string[] = [];

    for (const hour of selectedHours) {
      const timeSlot = AVAILABLE_TIMES.find((t) => t.hour === hour);
      if (!timeSlot) continue;

      const msgIndex = AVAILABLE_TIMES.indexOf(timeSlot);
      const body = messages[msgIndex] ?? messages[0];

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "✦ Time to Hagah",
          body,
          sound: true,
          data: { hour },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: timeSlot.hour,
          minute: timeSlot.minute,
        },
      });

      ids.push(id);
    }

    return ids;
  } catch (e) {
    console.error("Failed to schedule notifications:", e);
    return [];
  }
}

export async function cancelAllDeclarations(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
