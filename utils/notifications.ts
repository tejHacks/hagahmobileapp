import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ScheduledPeriod = {
  period: "morning" | "afternoon" | "evening";
  hour: number;   // 24-hr format
  minute: number;
};

const PERIOD_MESSAGES: Record<ScheduledPeriod["period"], string> = {
  morning:
    "Start your morning with the Word on your lips. Open Hagah and declare. הגה",
  afternoon:
    "Your midday declaration is ready. Rise and speak it out loud. הגה",
  evening:
    "End your day with the Word. Let it be the last thing you meditate on. הגה",
};

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

export async function scheduleDeclarationsForPeriods(
  periods: ScheduledPeriod[]
): Promise<string[]> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return [];

    await cancelAllDeclarations();

    const ids: string[] = [];
    for (const slot of periods) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "✦ Time to Hagah",
          body: PERIOD_MESSAGES[slot.period],
          sound: true,
          data: { period: slot.period, hour: slot.hour, minute: slot.minute },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
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

/* Uncomment to test delivery on real device:

export async function sendTestNotificationIn10Seconds(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "✦ Time to Hagah",
        body: PERIOD_MESSAGES.morning,
        sound: true,
        data: { test: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
    });
    return id;
  } catch (e) {
    console.error("Failed to send test notification:", e);
    return null;
  }
}
*/