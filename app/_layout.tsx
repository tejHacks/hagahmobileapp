import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  // No redirect logic needed here — index.tsx checks AsyncStorage's
  // "hagah_onboarded" flag on mount and replaces itself with /home/home
  // if the user has already been onboarded. This keeps the splash/
  // onboarding swiper as the single source of truth for first-launch logic.
  return <Stack screenOptions={{ headerShown: false }} />;
}