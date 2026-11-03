import React from "react";
import { Text } from "react-native";

function Verse({
    vNum,
    verse,
    isSelected,
    handleWordPress,
    handleVerseTap,
    handleVerseLongPress,
    styles,
    fontSize = 18,
    showStrongs = true,
}: {
    vNum: string;
    verse: any;
    isSelected: boolean;
    handleWordPress: (code: string) => void;
    handleVerseTap: (v: string) => void;
    handleVerseLongPress: (v: string) => void;
    styles: any;
    fontSize?: number;
    showStrongs?: boolean;
}) {
    return (
        <Text style={[styles.verseBlock, { fontSize }]} key={vNum}>
            <Text style={styles.verseNumSuper}>{vNum} </Text>
            {verse.words.map((w: any, idx: number) => {
                const hasStrongs = showStrongs && !!w.s && w.s.length > 0;
                return (
                    <Text
                        key={idx}
                        style={[
                            w.i && styles.italicWord,
                            hasStrongs && styles.strongsWord,
                            isSelected && styles.selectedWord,
                        ]}
                        onPress={hasStrongs ? () => handleWordPress(w.s![0]) : () => handleVerseTap(vNum)}
                        onLongPress={() => handleVerseLongPress(vNum)}
                        suppressHighlighting
                    >
                        {w.t}{" "}
                    </Text>
                );
            })}
        </Text>
    );
}

export default React.memo(Verse, (prev, next) => {
    // shallow compare props that matter for rendering
    return (
        prev.vNum === next.vNum &&
        prev.isSelected === next.isSelected &&
        prev.fontSize === next.fontSize &&
        prev.showStrongs === next.showStrongs &&
        prev.styles === next.styles &&
        prev.verse === next.verse
    );
});
