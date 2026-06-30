// import React, { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const { width, height } = Dimensions.get("window");

// type Slide = {
//   key: string;
//   eyebrow: string;
//   title: string;
//   body: string;
//   gradient: [string, string, string];
//   glow: string;
// };

// const SLIDES: Slide[] = [
//   {
//     key: "declare",
//     eyebrow: "DECLARE",
//     title: "Speak life over\nyour day",
//     body: "Five daily declarations rooted in scripture, voiced back to you so the Word doesn't just sit on a screen — it sits in your spirit.",
//     gradient: ["#2A1B0F", "#4A2E12", "#B8860B"],
//     glow: "#FFC94A",
//   },
//   {
//     key: "pad",
//     eyebrow: "PAD",
//     title: "Pin every prayer.\nTrack every answer.",
//     body: "Write down what you're believing God for. Tick it off when heaven answers. Your testimony, dated and kept.",
//     gradient: ["#1F1410", "#5C2A1A", "#A33D1F"],
//     glow: "#FF7A45",
//   },
//   {
//     key: "grow",
//     eyebrow: "GROW",
//     title: "Fight fear, lust,\nand every stronghold",
//     body: "Targeted scripture battle-plans for the things you're actually wrestling with. Open the Word. Fight here. Win here.",
//     gradient: ["#10180F", "#1F3320", "#3E5B2E"],
//     glow: "#8FBE6A",
//   },
//   {
//     key: "welcome",
//     eyebrow: "HAGAH",
//     title: "Meditate.\nDeclare. Become.",
//     body: "Hagah — to meditate, to mutter, to speak low and constant, like Joshua 1:8 commands. This is your daily place to do exactly that.",
//     gradient: ["#1A1006", "#3D2410", "#C9962C"],
//     glow: "#FFD56B",
//   },
// ];

// export default function OnboardingScreen() {
//   const router = useRouter();
//   const listRef = useRef<FlatList<Slide>>(null);
//   const [index, setIndex] = useState(0);
//   const scrollX = useRef(new Animated.Value(0)).current;

//   const onScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//     { useNativeDriver: false }
//   );

//   const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
//     setIndex(newIndex);
//   };

//   const finishOnboarding = async () => {
//     await AsyncStorage.setItem("hagah_onboarded", "true");
//     router.replace("/home/home");
//   };

//   const goNext = () => {
//     if (index < SLIDES.length - 1) {
//       listRef.current?.scrollToIndex({ index: index + 1 });
//     } else {
//       finishOnboarding();
//     }
//   };

//   const isLast = index === SLIDES.length - 1;

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={listRef}
//         data={SLIDES}
//         keyExtractor={(item) => item.key}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={onScroll}
//         onMomentumScrollEnd={onMomentumEnd}
//         scrollEventThrottle={16}
//         renderItem={({ item }) => (
//           <LinearGradient
//             colors={item.gradient}
//             start={{ x: 0.1, y: 0 }}
//             end={{ x: 0.9, y: 1 }}
//             style={styles.slide}
//           >
//             {/* signature glow orb — the one recurring motif across all slides */}
//             <View style={[styles.glowOrb, { backgroundColor: item.glow }]} />

//             <View style={styles.textBlock}>
//               <Text style={[styles.eyebrow, { color: item.glow }]}>
//                 {item.eyebrow}
//               </Text>
//               <Text style={styles.title}>{item.title}</Text>
//               <Text style={styles.body}>{item.body}</Text>
//             </View>
//           </LinearGradient>
//         )}
//       />

//       {/* dots */}
//       <View style={styles.dotsRow}>
//         {SLIDES.map((_, i) => {
//           const dotWidth = scrollX.interpolate({
//             inputRange: [(i - 1) * width, i * width, (i + 1) * width],
//             outputRange: [8, 24, 8],
//             extrapolate: "clamp",
//           });
//           const dotOpacity = scrollX.interpolate({
//             inputRange: [(i - 1) * width, i * width, (i + 1) * width],
//             outputRange: [0.3, 1, 0.3],
//             extrapolate: "clamp",
//           });
//           return (
//             <Animated.View
//               key={i}
//               style={[
//                 styles.dot,
//                 { width: dotWidth, opacity: dotOpacity },
//               ]}
//             />
//           );
//         })}
//       </View>

//       {/* bottom controls */}
//       <View style={styles.bottomRow}>
//         {!isLast ? (
//           <TouchableOpacity onPress={finishOnboarding} hitSlop={12}>
//             <Text style={styles.skipText}>Skip</Text>
//           </TouchableOpacity>
//         ) : (
//           <View style={{ width: 50 }} />
//         )}

//         <TouchableOpacity style={styles.nextButton} onPress={goNext}>
//           <Text style={styles.nextButtonText}>
//             {isLast ? "Begin" : "Next"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0E0A06",
//   },
//   slide: {
//     width,
//     height,
//     justifyContent: "center",
//     paddingHorizontal: 32,
//   },
//   glowOrb: {
//     position: "absolute",
//     top: height * 0.16,
//     alignSelf: "center",
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     opacity: 0.18,
//   },
//   textBlock: {
//     marginTop: 60,
//   },
//   eyebrow: {
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 4,
//     marginBottom: 14,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "800",
//     color: "#FBF6EC",
//     lineHeight: 40,
//     marginBottom: 18,
//   },
//   body: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: "rgba(251,246,236,0.78)",
//     maxWidth: "92%",
//   },
//   dotsRow: {
//     position: "absolute",
//     bottom: 130,
//     flexDirection: "row",
//     alignSelf: "center",
//     gap: 8,
//   },
//   dot: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#FFD56B",
//   },
//   bottomRow: {
//     position: "absolute",
//     bottom: 50,
//     left: 32,
//     right: 32,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   skipText: {
//     color: "rgba(251,246,236,0.6)",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   nextButton: {
//     backgroundColor: "#FFD56B",
//     paddingHorizontal: 28,
//     paddingVertical: 14,
//     borderRadius: 28,
//   },
//   nextButtonText: {
//     color: "#1A1006",
//     fontWeight: "800",
//     fontSize: 15,
//   },
// });



import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

type Slide = {
  key: string;
  isSplash?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient: [string, string, string];
  glow: string;
};

const SLIDES: Slide[] = [
  {
    key: "splash",
    isSplash: true,
    gradient: ["#1a0f00", "#2A1B0F", "#c9923a"],
    glow: "#f5d49a",
  },
  {
    key: "declare",
    eyebrow: "DECLARE",
    title: "Speak life over\nyour day",
    body: "Five daily declarations rooted in scripture, voiced back to you so the Word doesn't just sit on a screen — it sits in your spirit.",
    icon: "mic",
    gradient: ["#2A1B0F", "#4A2E12", "#B8860B"],
    glow: "#FFC94A",
  },
  {
    key: "pad",
    eyebrow: "PAD",
    title: "Pin every prayer.\nTrack every answer.",
    body: "Write down what you're believing God for. Tick it off when heaven answers. Your testimony, dated and kept.",
    icon: "pin",
    gradient: ["#1F1410", "#5C2A1A", "#A33D1F"],
    glow: "#FF7A45",
  },
  {
    key: "grow",
    eyebrow: "GROW",
    title: "Fight fear, lust,\nand every stronghold",
    body: "Targeted scripture battle-plans for the things you're actually wrestling with. Open the Word. Fight here. Win here.",
    icon: "shield",
    gradient: ["#10180F", "#1F3320", "#3E5B2E"],
    glow: "#8FBE6A",
  },
  {
    key: "welcome",
    eyebrow: "HAGAH",
    title: "Meditate.\nDeclare. Become.",
    body: "Hagah — to meditate, to mutter, to speak low and constant, like Joshua 1:8 commands. This is your daily place to do exactly that.",
    icon: "sparkles",
    gradient: ["#1A1006", "#3D2410", "#C9962C"],
    glow: "#FFD56B",
  },
];

export default function IndexScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [checking, setChecking] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Never replay onboarding after the first launch
  useEffect(() => {
    (async () => {
      const onboarded = await AsyncStorage.getItem("hagah_onboarded");
      if (onboarded === "true") {
        router.replace("/home/home");
      } else {
        setChecking(false);
      }
    })();
  }, [router]);

  if (checking) return null;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hagah_onboarded", "true");
    router.replace("/home/home");
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finishOnboarding();
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaProvider>
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
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.slide, styles.splashSlide]}
              >
                <Text style={styles.hebrew}>הגה</Text>
                <Text style={styles.appName}>Hagah</Text>
                <View style={styles.divider} />
                <Text style={styles.meaning}>
                  to meditate · to murmur · to declare
                </Text>
                <Text style={styles.scripture}>
                  &quot;This book of the law shall not depart out of thy mouth;{"\n"}
                  but thou shalt <Text style={styles.bold}>hagah</Text> therein day and night,{"\n"}
                  that thou mayest observe to do according to all that is written therein:{"\n"}
                  for then thou shalt make thy way prosperous, and then thou shalt have good success.&quot;
                </Text>
                <Text style={styles.ref}>Joshua 1:8</Text>
                <Text style={styles.footer}>Speak it. Believe it. Receive it.</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.slide}
              >
                <View style={[styles.glowOrb, { backgroundColor: item.glow }]} />

                <View style={styles.textBlock}>
                  <View style={[styles.iconCircle, { borderColor: item.glow }]}>
                    <Ionicons name={item.icon!} size={34} color={item.glow} />
                  </View>
                  <Text style={[styles.eyebrow, { color: item.glow }]}>
                    {item.eyebrow}
                  </Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
              </LinearGradient>
            )
          }
        />

        {/* dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* bottom controls */}
        <View style={styles.bottomRow}>
          {!isLast ? (
            <TouchableOpacity onPress={finishOnboarding} hitSlop={12}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextButtonText}>
              {isLast ? "Begin Declaring" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0A06",
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  splashSlide: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hebrew: {
    fontSize: 64,
    color: "#c9923a",
    marginBottom: 8,
    fontWeight: "300",
    letterSpacing: 4,
  },
  appName: {
    fontSize: 38,
    fontWeight: "700",
    color: "#f5d49a",
    letterSpacing: 6,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "#c9923a",
    marginBottom: 14,
    opacity: 0.6,
  },
  meaning: {
    fontSize: 13,
    color: "#c9923a99",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 28,
    textTransform: "lowercase",
  },
  scripture: {
    fontSize: 13,
    color: "#c9923a88",
    textAlign: "center",
    lineHeight: 21,
    fontStyle: "italic",
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  bold: {
    color: "#c9923a",
    fontWeight: "700",
    fontStyle: "italic",
  },
  ref: {
    fontSize: 11,
    color: "#c9923a55",
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  footer: {
    fontSize: 10,
    color: "#c9923a",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 8,
  },
  glowOrb: {
    position: "absolute",
    top: height * 0.14,
    alignSelf: "center",
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
  },
  textBlock: {
    marginTop: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FBF6EC",
    lineHeight: 40,
    marginBottom: 18,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(251,246,236,0.78)",
    maxWidth: "92%",
  },
  dotsRow: {
    position: "absolute",
    bottom: 130,
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD56B",
  },
  bottomRow: {
    position: "absolute",
    bottom: 50,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    color: "rgba(251,246,236,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#FFD56B",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  nextButtonText: {
    color: "#1A1006",
    fontWeight: "800",
    fontSize: 15,
  },
});