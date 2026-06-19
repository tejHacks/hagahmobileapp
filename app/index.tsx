import {
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          {/* Hebrew */}
          <Text style={styles.hebrew}>הגה</Text>

          {/* App Name */}
          <Text style={styles.appName}>Hagah</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Meaning */}
          <Text style={styles.meaning}>
            to meditate · to murmur · to declare
          </Text>
          {/* Scripture */}
          <Text style={styles.scripture}>
            "This book of the law shall not depart out of thy mouth;{"\n"}
            but thou shalt <Text style={styles.bold}>hagah</Text> therein day and night,{"\n"}
            that thou mayest observe to do according to all that is written therein:{"\n"}
            for then thou shalt make thy way prosperous, and then thou shalt have good success."
          </Text>

 <Text style={styles.ref}>Joshua 1:8</Text>

          {/* CTA */}
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.85}
            onPress={() => router.replace("/home/home")}
          >
            <Text style={styles.btnText}>Begin Declaring</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>Speak it. Believe it. Receive it.</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f00",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: width - 48,
    alignItems: "center",
  },
  hebrew: {
    fontSize: 72,
    color: "#c9923a",
    marginBottom: 8,
    fontWeight: "300",
    letterSpacing: 4,
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    color: "#f5d49a",
    letterSpacing: 6,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "#c9923a",
    marginBottom: 16,
    opacity: 0.6,
  },
  meaning: {
    fontSize: 13,
    color: "#c9923a99",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 36,
    textTransform: "lowercase",
  },
  scripture: {
    fontSize: 14,
    color: "#c9923a88",
    textAlign: "center",
    lineHeight: 22,
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
    marginBottom: 48,
    textTransform: "uppercase",
  },
  btn: {
    backgroundColor: "#c9923a",
    paddingVertical: 14,
    paddingHorizontal: 56,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 28,
  },
  btnText: {
    color: "#1a0f00",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    fontSize: 11,
    color: "#c9923a",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
