import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, type Theme } from "../components/themes/theme";

type Slide = {
  key: string;
  isSplash?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

const SLIDES: Slide[] = [
  { key: "splash", isSplash: true },
  {
    key: "declare",
    eyebrow: "DECLARE",
    title: "Speak life over\nyour day",
    body: "A declaration every day, rooted in the King James Bible. Tap Listen and Hagah reads it aloud, so the Word is in your ears as well as your mouth.",
    icon: "mic-outline",
  },
  {
    key: "bible",
    eyebrow: "SCRIPTURE",
    title: "The whole KJV,\nread to you",
    body: "Every book and chapter, with Strong's word tags for the Hebrew and Greek. Search any verse, or press play and let a chapter be read to you.",
    icon: "book-outline",
  },
  {
    key: "streak",
    eyebrow: "STREAK",
    title: "Day and night,\nday after day",
    body: "Meditate, declare or read each day and watch your streak grow. Small and steady, like Joshua 1:8.",
    icon: "flame-outline",
  },
  {
    key: "pad",
    eyebrow: "PAD",
    title: "Pin the words\nyou stand on",
    body: "Save the scriptures you are believing God for. Mark them answered when He answers. Your testimony, dated and kept.",
    icon: "bookmark-outline",
  },
];

const serif = Platform.select({ ios: "Georgia", default: "serif" });

export default function IndexScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [checking, setChecking] = useState(true);
  const [scrollX] = useState(() => new Animated.Value(0));

  // Never replay onboarding after the first launch
  useEffect(() => {
    (async () => {
      const onboarded = await AsyncStorage.getItem("hagah_onboarded");
      if (onboarded === "true") router.replace("/home/home");
      else setChecking(false);
    })();
  }, [router]);

  if (checking) return <View style={styles.container} />;

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false });
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hagah_onboarded", "true");
    router.replace("/home/home");
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) listRef.current?.scrollToIndex({ index: index + 1 });
    else finishOnboarding();
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        renderItem={({ item }) =>
          item.isSplash ? (
            <View style={[styles.slide, styles.splashSlide, { width }]}>
              <Text style={styles.hebrew}>הגה</Text>
              <Text style={styles.appName}>Hagah</Text>
              <View style={styles.divider} />
              <Text style={styles.meaning}>to meditate · to murmur · to declare</Text>
              <Text style={styles.scripture}>
                “This book of the law shall not depart out of thy mouth; but thou shalt{" "}
                <Text style={styles.bold}>meditate</Text> therein day and night, that thou mayest observe to do according to all
                that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.”
              </Text>
              <Text style={styles.ref}>Joshua 1:8</Text>
            </View>
          ) : (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon!} size={30} color={theme.colors.accent} />
              </View>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )
        }
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.25, 1, 0.25],
            extrapolate: "clamp",
          });
          return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} />;
        })}
      </View>

      <View style={styles.bottomRow}>
        {!isLast ? (
          <TouchableOpacity onPress={finishOnboarding} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
        <TouchableOpacity style={styles.nextButton} onPress={goNext} accessibilityRole="button">
          <Text style={styles.nextButtonText}>{isLast ? "Begin" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgBase },
    slide: { flex: 1, justifyContent: "center", paddingHorizontal: 32, paddingBottom: 120 },
    splashSlide: { alignItems: "center", paddingHorizontal: 28 },
    hebrew: { fontSize: 60, color: c.accent, marginBottom: 6, fontWeight: "300", letterSpacing: 4 },
    appName: { fontSize: 34, fontWeight: "700", color: c.textPrimary, letterSpacing: 8, marginBottom: 14, textTransform: "uppercase" },
    divider: { width: 56, height: 1, backgroundColor: c.borderStrong, marginBottom: 14 },
    meaning: { fontSize: 13, color: c.textMuted, letterSpacing: 2, textAlign: "center", marginBottom: 28 },
    scripture: { fontFamily: serif, fontSize: 16, color: c.textSecondary, textAlign: "center", lineHeight: 26, fontStyle: "italic", marginBottom: 10 },
    bold: { color: c.accent, fontWeight: "700" },
    ref: { fontSize: 11, color: c.textMuted, letterSpacing: 2, textTransform: "uppercase" },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.tint,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 4, marginBottom: 12, color: c.accent },
    title: { fontFamily: serif, fontSize: 32, fontWeight: "700", color: c.textPrimary, lineHeight: 40, marginBottom: 16 },
    body: { fontSize: 16, lineHeight: 25, color: c.textMuted, maxWidth: "94%" },
    dotsRow: { position: "absolute", bottom: 130, flexDirection: "row", alignSelf: "center", gap: 8 },
    dot: { height: 8, borderRadius: 4, backgroundColor: c.accent },
    bottomRow: {
      position: "absolute",
      bottom: 50,
      left: 32,
      right: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    skipText: { color: c.textMuted, fontSize: 15, fontWeight: "600" },
    nextButton: { backgroundColor: c.accent, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
    nextButtonText: { color: c.onAccent, fontWeight: "700", fontSize: 15 },
  });
}
