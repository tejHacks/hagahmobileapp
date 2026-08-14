import { Platform } from "react-native";

let Notifications: typeof import("expo-notifications") | null = null;
let _handlerSet = false;
async function getNotifications() {
  if (!Notifications) {
    // dynamic import to avoid running expo-notifications module-level
    // side-effects during app route scanning (Expo Go can error on auto
    // registration). Import only when notifications are actually used.
    Notifications = await import("expo-notifications");
  }
  if (!_handlerSet) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    _handlerSet = true;
  }
  return Notifications;
}

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
  const N = await getNotifications();
  if (Platform.OS === "android") {
    await N.setNotificationChannelAsync("hagah-declarations", {
      name: "Daily Declarations",
      importance: N.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existing } = await N.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await N.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDeclarationsForPeriods(
  periods: ScheduledPeriod[]
): Promise<string[]> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return [];
    await cancelAllDeclarations();

    const N = await getNotifications();
    const ids: string[] = [];
    for (const slot of periods) {
      const id = await N.scheduleNotificationAsync({
        content: {
          title: "✦ Time to Hagah",
          body: PERIOD_MESSAGES[slot.period],
          sound: true,
          data: { period: slot.period, hour: slot.hour, minute: slot.minute },
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
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
  const N = await getNotifications();
  await N.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  const N = await getNotifications();
  return await N.getAllScheduledNotificationsAsync();
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