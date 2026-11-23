/** Text prepared for text-to-speech, so the voice reads KJV naturally. */
export function speakable(text: string): string {
  return text
    .replace(/\[\[.*?\]\]/g, " ") // psalm headings
    .replace(/\bLORD'S\b/g, "Lord's")
    .replace(/\bLORD\b/g, "Lord") // small-caps LORD would otherwise be spelled out
    .replace(/\bGOD\b/g, "God")
    .replace(/\bJEHOVAH\b/g, "Jehovah")
    .replace(/[¶✦➔]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
