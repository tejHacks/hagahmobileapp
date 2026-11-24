import React from "react";
import { Text, View } from "react-native";
import { splitVerseTitle, type BibleVerse } from "../../data/bible";

function Verse({
    vNum,
    verse,
    isSelected,
    handleWordPress,
    handleVerseTap,
    handleVerseLongPress,
    styles,
    fontSize = 18,
    showStrongs = false,
}: {
    vNum: string;
    verse: BibleVerse;
    isSelected: boolean;
    handleWordPress: (code: string) => void;
    handleVerseTap: (v: string) => void;
    handleVerseLongPress: (v: string) => void;
    styles: any;
    fontSize?: number;
    showStrongs?: boolean;
}) {
    const { title, body } = splitVerseTitle(verse.words);
    const lineHeight = Math.round(fontSize * 1.72);
    const tap = () => handleVerseTap(vNum);
    const longPress = () => handleVerseLongPress(vNum);

    return (
        <View>
            {title && <Text style={[styles.psalmTitle, { fontSize: fontSize - 3 }]}>{title}</Text>}
            <Text
                style={[styles.verseBlock, { fontSize, lineHeight }, isSelected && styles.verseSelected]}
                onPress={tap}
                onLongPress={longPress}
                suppressHighlighting
            >
                <Text
                    style={[styles.verseNum, { fontSize: Math.max(11, fontSize * 0.62) }]}
                    onPress={tap}
                    onLongPress={longPress}
                    suppressHighlighting
                >
                    {vNum}{"\u00A0\u00A0"}
                </Text>
                {body.map((w, idx) => {
                    const code = showStrongs && w.s && w.s.length > 0 ? w.s[0] : null;
                    return (
                        <Text
                            key={idx}
                            style={[w.i && styles.italicWord, code && styles.strongsWord]}
                            onPress={code ? () => handleWordPress(code) : tap}
                            onLongPress={longPress}
                            suppressHighlighting={!code}
                        >
                            {w.t}{idx < body.length - 1 ? " " : ""}
                        </Text>
                    );
                })}
            </Text>
        </View>
    );
}

export default React.memo(Verse, (prev, next) => (
    prev.vNum === next.vNum &&
    prev.isSelected === next.isSelected &&
    prev.fontSize === next.fontSize &&
    prev.showStrongs === next.showStrongs &&
    prev.styles === next.styles &&
    prev.verse === next.verse &&
    prev.handleWordPress === next.handleWordPress &&
    prev.handleVerseTap === next.handleVerseTap &&
    prev.handleVerseLongPress === next.handleVerseLongPress
));
