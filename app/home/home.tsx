import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync } from "expo-audio";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../../components/ui/Navbar";
import { declarations } from "../../data/declarations";
import { isBookmarked, toggleBookmark } from "../../utils/bookmarks";

const TOTAL_READS = 5;
const SOUND_FILES = [
  { id: 1, title: "Golden Dawn", file: require("../../assets/sounds/atlasaudio-ambient-atmosphere-511882.mp3") },
  { id: 2, title: "Peaceful Harbor", file: require("../../assets/sounds/denis-pavlov-music-beautiful-worship-piano-peaceful-music-240319.mp3") },
  { id: 3, title: "Cedar Rest", file: require("../../assets/sounds/desifreemusic-heart-of-faith-spiritual-oud-amp-ambient-pads-459631.mp3") },
  { id: 4, title: "Still Waters", file: require("../../assets/sounds/jessequinn-peaceful-piano-soaking-instrumental-worship-track-loops-223094.mp3") },
  { id: 5, title: "Holy Quiet", file: require("../../assets/sounds/samuelfjohanns-deep-soft-ambient-cue-276821.mp3") },
  { id: 6, title: "Autumn Mercy", file: require("../../assets/sounds/soundreality-autumn-ambient-420193.mp3") },
  { id: 7, title: "Mountain Breath", file: require("../../assets/sounds/the_mountain-spiritual-meditation-444137.mp3") },
];

function getDailyDeclaration(dayOffset = 0) {
  const start = new Date("2026-01-01").getTime();
  const now = new Date().getTime();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + dayOffset;
  return declarations[dayIndex % declarations.length];
}

// "previous" moves backward in real time only — dayOffset is always >= 0
function getDisplayDate(dayOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function HomeScreen() {
  const [displayDayOffset, setDisplayDayOffset] = useState(0);
  const daily = useMemo(() => getDailyDeclaration(displayDayOffset), [displayDayOffset]);
  const dateLabel = useMemo(() => getDisplayDate(displayDayOffset), [displayDayOffset]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRead, setCurrentRead] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [activeSound, setActiveSound] = useState<number | null>(null);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const musicPulse = useRef(new Animated.Value(1)).current;

  const fullSpeechText = `${daily.ref}. ${daily.scripture}. Today's declaration. ${daily.declaration}`;
  const combinedText = `${daily.ref}\n"${daily.scripture}"\n\nToday's Declaration:\n${daily.declaration}`;

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: "mixWithOthers",
        });
      } catch (e) {
        console.log("Audio mode config skipped:", e);
      }
    })();

    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    const loadBookmark = async () => {
      const isFav = await isBookmarked(daily.id);
      setBookmarked(isFav);
    };
    loadBookmark();
  }, [daily.id]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (soundPlaying) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(musicPulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(musicPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      musicPulse.setValue(1);
    }
  }, [musicPulse, soundPlaying]);

  useEffect(() => {
    if (isPlaying) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulse.setValue(1);
    }
  }, [isPlaying, pulse]);

  const readNext = (count: number) => {
    if (count > TOTAL_READS) {
      setIsPlaying(false);
      setCurrentRead(0);
      return;
    }
    setCurrentRead(count);
    Speech.speak(fullSpeechText, {
      rate: 0.92,
      onDone: () => readNext(count + 1),
      onStopped: () => {
        setIsPlaying(false);
        setCurrentRead(0);
      },
      onError: () => {
        setIsPlaying(false);
        setCurrentRead(0);
      },
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      setCurrentRead(0);
      return;
    }
    setIsPlaying(true);
    Speech.speak(
      "Let's meditate on this together. I'll read it to you five times — say it out loud with me each time.",
      { onDone: () => readNext(1) }
    );
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(combinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = async () => {
    try {
      const shareText = `✦ HAGAH\n\n${combinedText}\n\n— Hagah App`;
      await Share.share({ message: shareText });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleToggleBookmark = async () => {
    const newState = await toggleBookmark(daily);
    setBookmarked(newState);
  };

  const handleSoundSelect = async (soundId: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const selected = SOUND_FILES.find((sound) => sound.id === soundId);
      if (!selected) return;

      const { sound } = await Audio.Sound.createAsync(selected.file, { shouldPlay: true, isLooping: true });
      soundRef.current = sound;
      setActiveSound(soundId);
      setSoundPlaying(true);
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const handleToggleSound = async () => {
    if (soundPlaying && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSoundPlaying(false);
      setActiveSound(null);
      return;
    }
    if (!activeSound) {
      setShowSounds(true);
      return;
    }
    await handleSoundSelect(activeSound);
  };

  // Only the past is allowed — dayOffset can only grow, never go below 0 (today)
  const handlePreviousDay = () => {
    setDisplayDayOffset((value) => value + 1);
  };
  const canGoForward = displayDayOffset > 0;
  const handleNextDay = () => {
    if (!canGoForward) return;
    setDisplayDayOffset((value) => Math.max(0, value - 1));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerLogo}>✦ HAGAH</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#241405", "#0d0700"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          <View style={styles.dayNavRow}>
            <TouchableOpacity style={styles.dayNavBtn} onPress={handlePreviousDay} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={16} color="#c9923a" />
            </TouchableOpacity>

            <View style={styles.dateGroup}>
              <Text style={styles.refLabel}>{daily.ref}</Text>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
            </View>

            <TouchableOpacity
              style={[styles.dayNavBtn, !canGoForward && styles.dayNavBtnDisabled]}
              onPress={handleNextDay}
              activeOpacity={canGoForward ? 0.7 : 1}
              disabled={!canGoForward}
            >
              <Ionicons name="chevron-forward" size={16} color={canGoForward ? "#c9923a" : "#3a2a10"} />
            </TouchableOpacity>
          </View>

          <Text style={styles.scriptureText}>&quot;{daily.scripture}&quot;</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.declLabel}>TODAY&apos;S DECLARATION</Text>
          <Text style={styles.declText}>{daily.declaration}</Text>

          {isPlaying && (
            <Text style={styles.readingText}>
              Meditating · {currentRead} of {TOTAL_READS}
            </Text>
          )}

          <View style={styles.controlRow}>
            <Animated.View style={{ transform: [{ scale: musicPulse }] }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setShowSounds(true)} activeOpacity={0.7}>
                <View style={[styles.smallCircle, soundPlaying && styles.smallCircleActive]}>
                  <Ionicons
                    name={soundPlaying ? "musical-notes" : "musical-note-outline"}
                    size={17}
                    color={soundPlaying ? "#1a0f00" : "#c9923a"}
                  />
                </View>
                <Text style={styles.smallBtnLabel}>{soundPlaying ? "Playing" : "Sounds"}</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.smallBtn} onPress={handleToggleBookmark} activeOpacity={0.7}>
              <View style={[styles.smallCircle, bookmarked && styles.smallCircleActive]}>
                <Ionicons
                  name={bookmarked ? "bookmark" : "bookmark-outline"}
                  size={17}
                  color={bookmarked ? "#1a0f00" : "#c9923a"}
                />
              </View>
              <Text style={styles.smallBtnLabel}>{bookmarked ? "Saved" : "Save"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBtn} onPress={handleCopy} activeOpacity={0.7}>
              <View style={[styles.smallCircle, copied && styles.smallCircleActive]}>
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied ? "#1a0f00" : "#c9923a"}
                />
              </View>
              <Text style={styles.smallBtnLabel}>{copied ? "Copied" : "Copy"}</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                onPress={handleTogglePlay}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={28}
                  color={isPlaying ? "#1a0f00" : "#c9923a"}
                />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.smallBtn} onPress={handleShare} activeOpacity={0.7}>
              <View style={styles.smallCircle}>
                <Ionicons name="share-outline" size={17} color="#c9923a" />
              </View>
              <Text style={styles.smallBtnLabel}>Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.playHint}>
            {isPlaying ? "Tap to stop" : "Tap to meditate · say it out loud, 5x"}
          </Text>
        </LinearGradient>

        <Modal visible={showSounds} transparent animationType="slide" onRequestClose={() => setShowSounds(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ambient Sounds</Text>
                <TouchableOpacity onPress={() => setShowSounds(false)} activeOpacity={0.8}>
                  <Ionicons name="close" size={20} color="#f5d49a" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Choose a sound to rest in the presence of God.</Text>

              {SOUND_FILES.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  style={[styles.soundRow, activeSound === sound.id && styles.soundRowActive]}
                  onPress={() => handleSoundSelect(sound.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.soundLabelGroup}>
                    <Ionicons name={activeSound === sound.id ? "musical-notes" : "volume-high-outline"} size={16} color="#f5d49a" />
                    <Text style={styles.soundName}>{sound.title}</Text>
                  </View>
                  <Text style={styles.soundHint}>{activeSound === sound.id && soundPlaying ? "Playing" : "Open"}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.modalButton} onPress={handleToggleSound} activeOpacity={0.85}>
                <Text style={styles.modalButtonText}>{soundPlaying ? "Stop sound" : "Play selected sound"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f00" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },
  headerLogo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c9923a",
    letterSpacing: 4,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 4 },

  card: {
    borderRadius: 18,
    padding: 24,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: "rgba(201, 146, 58, 0.2)",
    overflow: "hidden",
    shadowColor: "#c9923a",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  dayNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(201, 146, 58, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201, 146, 58, 0.08)",
  },
  dayNavBtnDisabled: {
    opacity: 0.35,
  },
  dateGroup: {
    alignItems: "center",
    gap: 2,
  },
  refLabel: {
    fontSize: 11,
    color: "#c9923a",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  dateLabel: {
    fontSize: 10,
    color: "rgba(201, 146, 58, 0.55)",
    letterSpacing: 1,
  },
  scriptureText: {
    fontSize: 15,
    color: "rgba(201, 146, 58, 0.8)",
    fontStyle: "italic",
    lineHeight: 24,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201, 146, 58, 0.15)",
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(201, 146, 58, 0.4)",
  },

  declLabel: {
    fontSize: 10,
    color: "rgba(201, 146, 58, 0.5)",
    letterSpacing: 2,
    marginBottom: 10,
  },
  declText: {
    fontSize: 18,
    color: "#f5d49a",
    lineHeight: 29,
    fontWeight: "400",
  },

  readingText: {
    fontSize: 12,
    color: "#c9923a",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 24,
  },

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    paddingHorizontal: 10,
  },

  smallBtn: {
    alignItems: "center",
    gap: 6,
    width: 56,
  },
  smallCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(201, 146, 58, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(201, 146, 58, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  smallCircleActive: {
    backgroundColor: "#c9923a",
    borderColor: "#c9923a",
  },
  smallBtnLabel: {
    fontSize: 10,
    color: "rgba(201, 146, 58, 0.6)",
    fontWeight: "600",
  },

  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(201, 146, 58, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnActive: {
    backgroundColor: "#c9923a",
  },

  playHint: {
    fontSize: 11,
    color: "rgba(201, 146, 58, 0.45)",
    textAlign: "center",
    marginTop: 16,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 6, 2, 0.8)",
  },
  modalCard: {
    backgroundColor: "#241405",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(201, 146, 58, 0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalTitle: {
    color: "#f5d49a",
    fontSize: 16,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "rgba(245, 212, 154, 0.7)",
    fontSize: 13,
    marginBottom: 12,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 146, 58, 0.12)",
  },
  soundRowActive: {
    backgroundColor: "rgba(201, 146, 58, 0.14)",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  soundLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  soundName: {
    color: "#f5d49a",
    fontSize: 14,
    fontWeight: "600",
  },
  soundHint: {
    color: "rgba(245, 212, 154, 0.64)",
    fontSize: 12,
  },
  modalButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#c9923a",
  },
  modalButtonText: {
    color: "#1a0f00",
    fontWeight: "700",
  },
});