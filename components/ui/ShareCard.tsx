import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type Declaration = { text: string; reference?: string };

type Props = {
    declaration: Declaration;
    style?: ViewStyle | ViewStyle[];
    image?: ImageSourcePropType;
    gradient?: readonly [string, string, ...string[]];
};

const ShareCard = React.forwardRef<View, Props>(function ShareCard(
    { declaration, style, image, gradient },
    ref
) {
    const colors = gradient && gradient.length >= 2
        ? gradient
        : (["#2A1B0F", "#B8860B"] as const);

    const Content = (
        <View style={styles.content}>
            <Text style={styles.brandTop}>HAGAH</Text>
            <View style={styles.divider} />
            <Text style={styles.quote} numberOfLines={8}>
                &quot;{declaration.text}&quot;
            </Text>
            {declaration.reference ? (
                <Text style={styles.ref}>{declaration.reference}</Text>
            ) : null}
            <Text style={styles.footer}>Speak the Word. Shape your world.</Text>
        </View>
    );

    return (
        <View ref={ref} collapsable={false} style={[styles.card, style]}>
            {image ? (
                <ImageBackground source={image} style={styles.bg} resizeMode="cover">
                    <View style={styles.darken} />
                    {Content}
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={colors}
                    style={styles.bg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {Content}
                </LinearGradient>
            )}
        </View>
    );
});

export default ShareCard;

const styles = StyleSheet.create({
    card: {
        width: 340,
        height: 420,
        borderRadius: 22,
        overflow: "hidden",
        alignSelf: "center",
        backgroundColor: "transparent",
    },
    bg: { flex: 1, justifyContent: "center" },
    darken: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 28,
    },
    brandTop: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 6,
        marginBottom: 14,
    },
    divider: {
        width: 36,
        height: 2,
        backgroundColor: "rgba(255,255,255,0.5)",
        borderRadius: 1,
        marginBottom: 20,
    },
    quote: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 30,
        marginBottom: 16,
    },
    ref: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 26,
    },
    footer: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 10,
        letterSpacing: 0.5,
        fontStyle: "italic",
        position: "absolute",
        bottom: 24,
    },
});