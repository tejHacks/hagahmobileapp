


import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync } from "expo-audio";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
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
import { Theme, useTheme } from "../../components/themes/theme";
import Navbar from "../../components/ui/Navbar";
import { declarations } from "../../data/declarations";
import { isBookmarked, toggleBookmark } from "../../utils/bookmarks";

const TOTAL_READS = 5;
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.olateju.hagahapp";
const SOUND_FILES = [
  {
    id: 1,
    title: "Golden Dawn",
    file: require("../../assets/audio/atlasaudio-ambient-atmosphere-511882.m4a"),
  },
  {
    id: 2,
    title: "Peaceful Harbor",
    file: require("../../assets/audio/denis-pavlov-music-beautiful-worship-piano-peaceful-music-240319.m4a"),
  },
  {
    id: 3,
    title: "Cedar Rest",
    file: require("../../assets/audio/desifreemusic-heart-of-faith-spiritual-oud-amp-ambient-pads-459631.m4a"),
  },
  {
    id: 4,
    title: "Still Waters",
    file: require("../../assets/audio/jessequinn-peaceful-piano-soaking-instrumental-worship-track-loops-223094.m4a"),
  },
  {
    id: 5,
    title: "Holy Quiet",
    file: require("../../assets/audio/samuelfjohanns-deep-soft-ambient-cue-276821.m4a"),
  },
  {
    id: 6,
    title: "Autumn Mercy",
    file: require("../../assets/audio/soundreality-autumn-ambient-420193.m4a"),
  },
  {
    id: 7,
    title: "Mountain Breath",
    file: require("../../assets/audio/the_mountain-spiritual-meditation-444137.m4a"),
  },
];

function getDailyDeclaration(dayOffset = 0) {
  const start = new Date("2026-01-01").getTime();
  const now = new Date().getTime();
  const dayIndex =
    Math.floor((now - start) / (1000 * 60 * 60 * 24)) + dayOffset;
  return declarations[dayIndex % declarations.length];
}

// "previous" moves backward in real time only — dayOffset is always >= 0
function getDisplayDate(dayOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [displayDayOffset, setDisplayDayOffset] = useState(0);
  const daily = useMemo(
    () => getDailyDeclaration(displayDayOffset),
    [displayDayOffset],
  );
  const dateLabel = useMemo(
    () => getDisplayDate(displayDayOffset),
    [displayDayOffset],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRead, setCurrentRead] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [activeSound, setActiveSound] = useState<number | null>(null);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);

  const fullSpeechText = `${daily.ref}. ${daily.scripture}. Today's declaration. ${daily.declaration}`;
  const combinedText = `${daily.ref}\n"${daily.scripture}"\n\nToday's Declaration:\n${daily.declaration}`;

  useEffect(() => {
    isMountedRef.current = true;

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
      isMountedRef.current = false;
      Speech.stop();
      void (async () => {
        if (soundRef.current) {
          const currentSound = soundRef.current;
          soundRef.current = null;
          try {
            await currentSound.stopAsync();
          } catch { }
          try {
            await currentSound.unloadAsync();
          } catch { }
        }
      })();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBookmark = async () => {
      const isFav = await isBookmarked(daily.id);
      if (!cancelled && isMountedRef.current) {
        setBookmarked(isFav);
      }
    };

    void loadBookmark();

    return () => {
      cancelled = true;
    };
  }, [daily.id]);


  useEffect(() => {
    if (!isPlaying) {
      pulse.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
      pulse.setValue(1);
    };
  }, [isPlaying, pulse]);

  // scripture display (no animation)

  const readNext = (count: number) => {
    if (count > TOTAL_READS) {
      if (isMountedRef.current) {
        setIsPlaying(false);
        setCurrentRead(0);
      }
      return;
    }

    if (!isMountedRef.current) return;

    setCurrentRead(count);
    Speech.speak(fullSpeechText, {
      rate: 0.92,
      onDone: () => {
        if (isMountedRef.current) {
          readNext(count + 1);
        }
      },
      onStopped: () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setCurrentRead(0);
        }
      },
      onError: () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setCurrentRead(0);
        }
      },
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      Speech.stop();
      if (isMountedRef.current) {
        setIsPlaying(false);
        setCurrentRead(0);
      }
      return;
    }

    if (!isMountedRef.current) return;

    setIsPlaying(true);
    Speech.speak(
      "Let's meditate on this together. I'll read it to you five times — say it out loud with me each time.",
      {
        onDone: () => {
          if (isMountedRef.current) {
            readNext(1);
          }
        },
      },
    );
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(combinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = async () => {
    try {
      const shareText = `✦ HAGAH

${daily.ref}

"${daily.scripture}"

Today's Declaration:
${daily.declaration}

Speak the Word. Shape your world.

Get Hagah on Google Play:
${PLAY_STORE_URL}`;

      await Share.share({
        message: shareText,
      });
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

      const selected = SOUND_FILES.find(
        (sound) => sound.id === soundId,
      );

      if (!selected) return;

      const { sound } = await Audio.Sound.createAsync(
        selected.file,
        {
          shouldPlay: true,
          isLooping: true,
        },
      );

      soundRef.current = sound;
      setActiveSound(soundId);
      setSoundPlaying(true);
      setShowSounds(false);
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
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* --------------------------------------------------------------- */}
        {/* HEADER                                                          */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>HAGAH</Text>
            <Text style={styles.brandSub}>SPEAK THE WORD</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.75}
            onPress={() => setShowSounds(true)}
          >
            <Ionicons
              name={soundPlaying ? "musical-notes" : "musical-note-outline"}
              size={18}
              color={theme.colors.accent}
            />
          </TouchableOpacity>
        </View>

        {/* --------------------------------------------------------------- */}
        {/* DAY / DATE                                                      */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={handlePreviousDay}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={17}
              color={theme.colors.accent}
            />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.dateRef}>{daily.ref}</Text>

            <Text style={styles.dateLabel}>
              {dateLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.dateArrow,
              !canGoForward && styles.dateArrowDisabled,
            ]}
            onPress={handleNextDay}
            activeOpacity={canGoForward ? 0.7 : 1}
            disabled={!canGoForward}
          >
            <Ionicons
              name="chevron-forward"
              size={17}
              color={
                canGoForward
                  ? theme.colors.accent
                  : theme.colors.textDisabled
              }
            />
          </TouchableOpacity>
        </View>

        {/* --------------------------------------------------------------- */}
        {/* SCRIPTURE                                                       */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.scriptureSection}>
          <View style={styles.ornament}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentMark}>✦</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={styles.scriptureText}>“{daily.scripture}”</Text>

        </View>

        {/* --------------------------------------------------------------- */}
        {/* DECLARATION                                                     */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.declarationSection}>
          <Text style={styles.sectionEyebrow}>
            TODAY&apos;S DECLARATION
          </Text>

          <Text style={styles.declarationText}>
            {daily.declaration}
          </Text>
        </View>

        {/* --------------------------------------------------------------- */}
        {/* MEDITATION ACTION                                               */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.meditationSection}>
          {isPlaying && (
            <Text style={styles.readingProgress}>
              MEDITATING · {currentRead} OF {TOTAL_READS}
            </Text>
          )}

          <Animated.View
            style={{
              transform: [{ scale: pulse }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.meditateButton,
                isPlaying && styles.meditateButtonActive,
              ]}
              onPress={handleTogglePlay}
              activeOpacity={0.86}
            >
              <View style={[styles.meditateIcon, isPlaying && styles.meditateIconActive]}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={18}
                  color={isPlaying ? theme.colors.onAccent : theme.colors.accent}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.meditateTitle,
                    isPlaying && {
                      color: theme.colors.onAccent,
                    },
                  ]}
                >
                  {isPlaying ? "Meditating" : "Speak It"}
                </Text>

                <Text
                  style={[
                    styles.meditateSubtitle,
                    isPlaying && {
                      color: theme.colors.onAccent,
                    },
                  ]}
                >
                  {isPlaying
                    ? `Reading ${currentRead} of ${TOTAL_READS}`
                    : "Say the Word out loud"}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.meditateHint}>
            {isPlaying
              ? "Tap to stop"
              : "Read it. Speak it. Let the Word settle."}
          </Text>
        </View>

        {/* --------------------------------------------------------------- */}
        {/* QUICK ACTIONS                                                   */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.actionsSection}>



          <TouchableOpacity
            style={styles.action}
            onPress={handleToggleBookmark}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.actionIcon,
                bookmarked && styles.actionIconActive,
              ]}
            >
              <Ionicons
                name={
                  bookmarked
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={17}
                color={
                  bookmarked
                    ? theme.colors.onAccent
                    : theme.colors.accent
                }
              />
            </View>

            <Text style={styles.actionLabel}>
              {bookmarked ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.action}
            onPress={handleCopy}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.actionIcon,
                copied && styles.actionIconActive,
              ]}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={17}
                color={
                  copied
                    ? theme.colors.onAccent
                    : theme.colors.accent
                }
              />
            </View>

            <Text style={styles.actionLabel}>
              {copied ? "Copied" : "Copy"}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.action}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="share-outline"
                size={17}
                color={theme.colors.accent}
              />
            </View>

            <Text style={styles.actionLabel}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* --------------------------------------------------------------- */}
        {/* FOOTNOTE                                                        */}
        {/* --------------------------------------------------------------- */}

        <View style={styles.footerMessage}>
          <View style={styles.footerLine} />

          <Text style={styles.footerText}>
            Speak the Word. Shape your world.
          </Text>

          <View style={styles.footerLine} />
        </View>

        {/* --------------------------------------------------------------- */}
        {/* SOUND MODAL                                                     */}
        {/* --------------------------------------------------------------- */}

        <Modal
          visible={showSounds}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSounds(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalEyebrow}>
                    AMBIENT
                  </Text>

                  <Text style={styles.modalTitle}>
                    Sounds for Stillness
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowSounds(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Choose a sound to accompany your meditation.
              </Text>

              {SOUND_FILES.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundRow,
                    activeSound === sound.id &&
                    styles.soundRowActive,
                  ]}
                  onPress={() => handleSoundSelect(sound.id)}
                  activeOpacity={0.82}
                >
                  <View style={styles.soundLabelGroup}>
                    <View
                      style={[
                        styles.soundIcon,
                        activeSound === sound.id &&
                        styles.soundIconActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          activeSound === sound.id
                            ? "musical-notes"
                            : "volume-high-outline"
                        }
                        size={15}
                        color={
                          activeSound === sound.id
                            ? theme.colors.onAccent
                            : theme.colors.accent
                        }
                      />
                    </View>

                    <Text style={styles.soundName}>
                      {sound.title}
                    </Text>
                  </View>

                  {activeSound === sound.id &&
                    soundPlaying ? (
                    <View style={styles.playingBadge}>
                      <Text style={styles.playingBadgeText}>
                        PLAYING
                      </Text>
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.textFaint}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {activeSound !== null && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleToggleSound}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={
                      soundPlaying
                        ? "stop"
                        : "play"
                    }
                    size={17}
                    color={theme.colors.onAccent}
                  />

                  <Text style={styles.modalButtonText}>
                    {soundPlaying
                      ? "Stop sound"
                      : "Play selected sound"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}


// STYLE FOR THE PAGE::
function createStyles(theme: Theme) {
  const c = theme.colors;

  return StyleSheet.create({
    // -----------------------------------------------------------------------
    // SCREEN
    // -----------------------------------------------------------------------

    safe: {
      flex: 1,
      backgroundColor: c.bgBase,
    },

    scroll: {
      paddingHorizontal: 22,
      paddingTop: 8,
    },

    // -----------------------------------------------------------------------
    // HEADER
    // -----------------------------------------------------------------------

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 34,
    },

    brand: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 5,
      color: c.accent,
    },

    brandSub: {
      marginTop: 5,
      fontSize: 8,
      fontWeight: "700",
      letterSpacing: 2.4,
      color: c.textFaint,
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgSurface,
      borderWidth: 1,
      borderColor: c.border,
    },

    // -----------------------------------------------------------------------
    // DATE
    // -----------------------------------------------------------------------

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 30,
    },

    dateArrow: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgSurface,
      borderWidth: 1,
      borderColor: c.border,
    },

    dateArrowDisabled: {
      opacity: 0.35,
    },

    dateCenter: {
      alignItems: "center",
      justifyContent: "center",
    },

    dateRef: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 2.4,
      color: c.accent,
      textTransform: "uppercase",
    },

    dateLabel: {
      marginTop: 6,
      fontSize: 12,
      color: c.textMuted,
      letterSpacing: 0.4,
    },

    // -----------------------------------------------------------------------
    // SCRIPTURE
    // -----------------------------------------------------------------------

    scriptureSection: {
      paddingVertical: 8,
      marginBottom: 34,
    },

    ornament: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 18,
    },

    ornamentLine: {
      width: 44,
      height: 1,
      backgroundColor: c.border,
    },

    ornamentMark: {
      fontSize: 14,
      color: c.accent,
    },

    scriptureText: {
      fontSize: 28,
      lineHeight: 38,
      color: c.textPrimary,
      fontWeight: "500",
      textAlign: "center",
      letterSpacing: -0.4,
    },



    // -----------------------------------------------------------------------
    // DECLARATION
    // -----------------------------------------------------------------------

    declarationSection: {
      paddingTop: 28,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
    },

    sectionEyebrow: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 2.6,
      color: c.accent,
      marginBottom: 14,
    },

    declarationText: {
      fontSize: 20,
      lineHeight: 31,
      color: c.textSecondary,
      fontWeight: "500",
      letterSpacing: -0.15,
    },

    // -----------------------------------------------------------------------
    // MEDITATION
    // -----------------------------------------------------------------------

    meditationSection: {
      alignItems: "center",
      marginTop: 28,
    },

    readingProgress: {
      marginBottom: 12,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 2,
      color: c.accent,
    },

    meditateButton: {
      width: 210,
      minHeight: 64,

      paddingHorizontal: 18,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 13,

      backgroundColor: c.accent,
      borderRadius: 18,

      borderWidth: 1,
      borderColor: c.accent,

      shadowColor: c.accent,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12,

      elevation: 5,
    },

    meditateButtonActive: {
      backgroundColor: c.bgSurface,
      borderColor: c.accent,
    },

    meditateIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: c.bgBase,
      borderWidth: 1,
      borderColor: c.border,
    },
    meditateIconActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    meditateTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: c.onAccent,
      letterSpacing: 0.2,
    },

    meditateSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: c.onAccent,
      opacity: 0.72,
    },

    meditateHint: {
      marginTop: 11,
      fontSize: 10,
      color: c.textFaint,
      letterSpacing: 0.2,
    },

    // -----------------------------------------------------------------------
    // ACTIONS
    // -----------------------------------------------------------------------

    actionsSection: {
      marginTop: 30,
      paddingVertical: 17,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",

      backgroundColor: c.bgSurface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.borderSubtle,
    },

    action: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    actionIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },

    actionIconActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },

    actionLabel: {
      fontSize: 9,
      color: c.textMuted,
      fontWeight: "700",
      letterSpacing: 0.2,
    },

    actionDivider: {
      width: 1,
      height: 28,
      backgroundColor: c.borderSubtle,
    },

    // -----------------------------------------------------------------------
    // FOOTER
    // -----------------------------------------------------------------------

    footerMessage: {
      marginTop: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    footerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.borderSubtle,
    },

    footerText: {
      fontSize: 9,
      color: c.textFaint,
      letterSpacing: 1,
      textAlign: "center",
    },

    // -----------------------------------------------------------------------
    // SOUND MODAL
    // -----------------------------------------------------------------------

    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: c.overlay,
    },

    modalCard: {
      backgroundColor: c.bgElevated,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 24,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      borderTopWidth: 1,
      borderColor: c.border,
    },

    modalHandle: {
      alignSelf: "center",
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.borderStrong,
      marginBottom: 20,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    modalEyebrow: {
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 2.3,
      color: c.accent,
      marginBottom: 5,
    },

    modalTitle: {
      color: c.textPrimary,
      fontSize: 21,
      fontWeight: "700",
    },

    modalClose: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgSurface,
    },

    modalSubtitle: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 9,
      marginBottom: 16,
    },

    soundRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },

    soundRowActive: {
      backgroundColor: c.tint,
      borderRadius: 12,
      paddingHorizontal: 10,
      borderBottomColor: "transparent",
    },

    soundLabelGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    soundIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bgSurface,
    },

    soundIconActive: {
      backgroundColor: c.accent,
    },

    soundName: {
      color: c.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },

    playingBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: c.tint,
    },

    playingBadgeText: {
      color: c.accent,
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 1,
    },

    modalButton: {
      marginTop: 18,
      minHeight: 52,
      borderRadius: 15,
      backgroundColor: c.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    modalButtonText: {
      color: c.onAccent,
      fontSize: 14,
      fontWeight: "800",
    },
  });
}
