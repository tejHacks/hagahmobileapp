import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../../components/ui/Navbar";
import { Theme, useTheme } from "../../components/themes/theme";

type Section = {
  iconType: "hebrew" | "ionicons" | "mci";
  iconName?: string;
  title: string;
  body: string;
};

const sections: Section[] = [
  {
    iconType: "hebrew",
    title: "What is Hagah?",
    body: "Hagah (הגה) is the Hebrew word for meditate — but it means far more than quiet reflection. It means to murmur, to mutter, to declare aloud. It is the sound a lion makes over its prey. It is intentional, vocal, repeated confession of God's Word.",
  },
  {
    iconType: "ionicons",
    iconName: "color-wand-outline",
    title: "How it works",
    body: "Each day, you receive one scripture-backed declaration. Read it. Speak it aloud. Tap through all 5 meditation circles. Let the Word of God saturate your spirit before you face the day.",
  },
  {
    iconType: "ionicons",
    iconName: "flame-outline",
    title: "Why declarations?",
    body: "Proverbs 18:21 says death and life are in the power of the tongue. Romans 10:10 says with the mouth, confession is made unto salvation. What you speak consistently, you begin to believe. What you believe, you walk in.",
  },
  {
    iconType: "mci",
    iconName: "book-open-variant",
    title: "The scriptures",
    body: "Every declaration in Hagah is rooted in scripture. We don't make things up — every word is anchored in the Bible. You will find references from Genesis to Revelation, covering dominion, healing, prosperity, purpose, and more.",
  },
];

type Currency = "ngn" | "usd" | "gbp" | "eur" | null;

const CURRENCIES: {
  key: Currency;
  flag: string;
  label: string;
  sublabel: string;
}[] = [
    { key: "ngn", flag: "🇳🇬", label: "NGN", sublabel: "Nigeria" },
    { key: "usd", flag: "🇺🇸", label: "USD", sublabel: "USA" },
    { key: "gbp", flag: "🇬🇧", label: "GBP", sublabel: "UK" },
    { key: "eur", flag: "🇪🇺", label: "EUR", sublabel: "Europe" },
  ];

type DetailRow = { key: string; val: string; highlight?: boolean };

const ACCOUNT_DETAILS: Record<
  Exclude<Currency, null>,
  { label: string; rows: DetailRow[]; note?: string }
> = {
  ngn: {
    label: "NIGERIAN BANK DETAILS",
    rows: [
      { key: "Bank", val: "Access Bank PLC" },
      { key: "Name", val: "Olamide Olateju Emmanuel" },
      { key: "Account No", val: "1960476133", highlight: true },
    ],
  },
  usd: {
    label: "USD BANK DETAILS",
    rows: [
      { key: "Bank", val: "Lead Bank" },
      { key: "Name", val: "Olateju Emmanuel Olamide" },
      { key: "Account No", val: "210686508326", highlight: true },
      { key: "Account Type", val: "Checking" },
      { key: "ACH Routing", val: "101019644", highlight: true },
      { key: "Wire Routing", val: "101019644" },
      { key: "Address", val: "1801 Main St., Kansas City, MO 64108" },
    ],
    note: "ACH: 1 free deposit/month, then $1 per deposit. Wire: $10 per deposit.",
  },
  gbp: {
    label: "GBP BANK DETAILS",
    rows: [
      { key: "Bank", val: "Clear Junction Limited" },
      { key: "Name", val: "Olateju Emmanuel Olamide" },
      { key: "Account No", val: "42918984", highlight: true },
      { key: "IBAN", val: "GB50CLJU04130742918984", highlight: true },
      { key: "Swift", val: "CLJUGB21XXX" },
      { key: "Sort Code", val: "041307" },
      {
        key: "Address",
        val: "4th Floor Imperial House, 15 Kingsway, London WC2B 6UN",
      },
    ],
  },
  eur: {
    label: "EUR BANK DETAILS",
    rows: [
      { key: "Bank", val: "Clear Junction Limited" },
      { key: "Name", val: "Olateju Emmanuel Olamide" },
      { key: "Account No", val: "42918984", highlight: true },
      { key: "IBAN", val: "GB50CLJU04130742918984", highlight: true },
      { key: "Swift", val: "CLJUGB21XXX" },
      { key: "Sort Code", val: "041307" },
      {
        key: "Address",
        val: "4th Floor Imperial House, 15 Kingsway, London WC2B 6UN",
      },
    ],
    note: "EUR payments accepted via the same Clear Junction multi-currency account.",
  },
};

function buildCopyText(currency: Exclude<Currency, null>): string {
  const { label, rows } = ACCOUNT_DETAILS[currency];
  return [label, ...rows.map((r) => `${r.key}: ${r.val}`)].join("\n");
}

export default function AboutScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selected, setSelected] = useState<Currency>(null);
  const [copied, setCopied] = useState(false);

  const handleSelect = (c: Currency) => {
    setSelected(c);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selected) return;
    await Clipboard.setStringAsync(buildCopyText(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    Alert.alert(
      "Details Copied ✦",
      "Bank details copied to clipboard. Thank you — may God bless your giving.",
      [{ text: "Amen 🙏" }],
    );
  };

  const details = selected ? ACCOUNT_DETAILS[selected] : null;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroHebrew}>הגה</Text>
          <Text style={styles.heroName}>HAGAH</Text>
          <Text style={styles.heroTagline}>
            Speak the Word. Shape your world.
          </Text>
        </View>

        {/* Info sections */}
        {sections.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.iconWrap}>
              {s.iconType === "hebrew" ? (
                <Text style={styles.cardHebrewIcon}>הגה</Text>
              ) : s.iconType === "ionicons" ? (
                <Ionicons
                  name={
                    s.iconName as React.ComponentProps<typeof Ionicons>["name"]
                  }
                  size={22}
                  color={theme.colors.accent}
                />
              ) : (
                <MaterialCommunityIcons
                  name={
                    s.iconName as React.ComponentProps<
                      typeof MaterialCommunityIcons
                    >["name"]
                  }
                  size={22}
                  color={theme.colors.accent}
                />
              )}
            </View>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        {/* Support / Donation */}
        <View style={styles.supportSection}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIconWrap}>
              <Ionicons name="heart" size={18} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Support our development</Text>
              <Text style={styles.supportSub}>
                Hagah is free — and will stay free. If it has blessed you, sow
                into it.
              </Text>
            </View>
          </View>

          <Text style={styles.supportBody}>
            We are building more declarations, battle scriptures, guided
            prayers, and features that put God&apos;s Word deeper into everyday life.
            Every seed you sow goes into that work.
          </Text>

          {/* Currency picker — 2×2 grid */}
          <Text style={styles.selectLabel}>SELECT YOUR CURRENCY</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((c) => {
              const isActive = selected === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.currencyBtn,
                    isActive && styles.currencyBtnActive,
                  ]}
                  onPress={() => handleSelect(c.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.currencyFlag}>{c.flag}</Text>
                  <Text
                    style={[
                      styles.currencyLabel,
                      isActive && styles.currencyLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                  <Text
                    style={[
                      styles.currencySub,
                      isActive && styles.currencySubActive,
                    ]}
                  >
                    {c.sublabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bank details */}
          {selected && details && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>{details.label}</Text>

              {details.rows.map((row, i, arr) => (
                <React.Fragment key={row.key}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>{row.key}</Text>
                    <Text
                      style={[
                        styles.detailVal,
                        row.highlight && styles.detailHighlight,
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                    >
                      {row.val}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.detailDivider} />}
                </React.Fragment>
              ))}

              {details.note && (
                <View style={styles.noteRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={13}
                    color={theme.colors.accent}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.noteText}>{details.note}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnDone]}
                onPress={handleCopy}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={14}
                  color={theme.colors.onAccent}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.copyBtnText}>
                  {copied ? "Copied!" : "Copy details"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVerse}>
            {
              '"This book of the law shall not depart out of thy mouth;\nbut thou shalt '
            }
            <Text style={styles.footerBold}>hagah</Text>
            {
              ' therein day and night,\nthat thou mayest observe to do according to all that is written therein:\nfor then thou shalt make thy way prosperous, and then thou shalt have good success."'
            }
          </Text>
          <Text style={styles.footerRef}>Joshua 1:8</Text>
          <Text style={styles.footerCredit}>
            Built with faith. Made for purpose.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  const c = theme.colors;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgBase },
    scroll: { paddingHorizontal: 20, paddingTop: 16 },

    // Hero
    hero: {
      alignItems: "center",
      paddingVertical: 28,
      borderBottomWidth: 0.5,
      borderBottomColor: c.borderSubtle,
      marginBottom: 16,
    },
    heroHebrew: {
      fontSize: 52,
      color: c.accent,
      fontWeight: "300",
      letterSpacing: 4,
      marginBottom: 4,
    },
    heroName: {
      fontSize: 24,
      fontWeight: "700",
      color: c.textPrimary,
      letterSpacing: 8,
      marginBottom: 8,
    },
    heroTagline: {
      fontSize: 13,
      color: c.textFaint,
      letterSpacing: 1,
      fontStyle: "italic",
    },

    // Info cards
    card: {
      backgroundColor: c.bgSurface,
      borderRadius: 14,
      padding: 18,
      borderWidth: 0.5,
      borderColor: c.borderSubtle,
      marginBottom: 12,
      gap: 8,
    },
    iconWrap: { height: 26, justifyContent: "center" },
    cardHebrewIcon: { fontSize: 18, fontWeight: "700", color: c.accent },
    cardTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: c.textPrimary,
      letterSpacing: 0.5,
    },
    cardBody: { fontSize: 14, color: c.textMuted, lineHeight: 22 },

    // Support section
    supportSection: {
      backgroundColor: c.bgSurface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 0.5,
      borderColor: c.border,
      marginBottom: 16,
      gap: 14,
    },
    supportHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    supportIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.tint,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    supportTitle: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 3,
    },
    supportSub: { color: c.textFaint, fontSize: 12, lineHeight: 18 },
    supportBody: { color: c.textFaint, fontSize: 13, lineHeight: 21 },

    selectLabel: {
      color: c.accent,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
      marginBottom: 4,
    },

    // 2×2 currency grid
    currencyGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    currencyBtn: {
      width: "47%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.bgSunken,
      borderWidth: 1,
      borderColor: c.border,
      gap: 3,
    },
    currencyBtnActive: {
      borderColor: c.accent,
      backgroundColor: c.tint,
    },
    currencyFlag: { fontSize: 22 },
    currencyLabel: { color: c.textFaint, fontSize: 15, fontWeight: "800" },
    currencyLabelActive: { color: c.accent },
    currencySub: { color: c.textDisabled, fontSize: 11 },
    currencySubActive: { color: c.textMuted },

    // Bank details
    detailsCard: {
      backgroundColor: c.bgSunken,
      borderRadius: 14,
      padding: 16,
      borderWidth: 0.5,
      borderColor: c.border,
    },
    detailsLabel: {
      color: c.accent,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 2,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 9,
      gap: 12,
    },
    detailDivider: { height: 0.5, backgroundColor: c.borderSubtle },
    detailKey: { color: c.textFaint, fontSize: 12, flex: 0.38 },
    detailVal: {
      color: c.textPrimary,
      fontSize: 12,
      fontWeight: "600",
      flex: 0.62,
      textAlign: "right",
    },
    detailHighlight: { color: c.accent, fontSize: 13, fontWeight: "800" },

    noteRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 12,
      marginBottom: 2,
    },
    noteText: { color: c.textFaint, fontSize: 11, lineHeight: 17, flex: 1 },

    copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.accent,
      borderRadius: 10,
      paddingVertical: 13,
      marginTop: 14,
    },
    copyBtnDone: { backgroundColor: c.textPrimary },
    copyBtnText: { color: c.onAccent, fontWeight: "800", fontSize: 13 },

    // Footer
    footer: { alignItems: "center", paddingVertical: 28, gap: 10 },
    footerVerse: {
      fontSize: 12,
      color: c.textFaint,
      fontStyle: "italic",
      textAlign: "center",
      lineHeight: 20,
    },
    footerBold: { color: c.accent, fontWeight: "700" },
    footerRef: {
      fontSize: 11,
      color: c.accent,
      opacity: 0.8,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    footerCredit: {
      fontSize: 11,
      color: c.textFaint,
      letterSpacing: 1,
      marginTop: 4,
    },
  });
}
