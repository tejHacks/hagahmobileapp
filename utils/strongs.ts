/**
 * utils/strongs.ts
 * ---------------------------------------------------------------------------
 * Strong's Hebrew & Greek dictionaries (James Strong, 1890/1894 — public
 * domain). JSON text sourced from openscriptures/strongs, CC-BY-SA JSON
 * conversion of the original public-domain e-text.
 * https://github.com/openscriptures/strongs
 *
 * These two files (~2.8MB combined) load eagerly since a definition needs
 * to appear instantly when the user taps a tagged word — unlike the KJV
 * book text, they're small enough that inlining them in the JS bundle is
 * the simpler and faster option.
 * ---------------------------------------------------------------------------
 */

import greekDict from "../assets/bible/strongs/greek.json";
import hebrewDict from "../assets/bible/strongs/hebrew.json";

export type StrongsEntry = {
  lemma?: string;
  xlit?: string;
  pron?: string;
  def?: string;
  kjv?: string;
  deriv?: string;
};

const hebrew = hebrewDict as Record<string, StrongsEntry>;
const greek = greekDict as Record<string, StrongsEntry>;

/**
 * Look up a Strong's number, e.g. "H430" or "G3056".
 * Returns undefined if the code isn't found (a handful of numbers in the
 * source concordance were retired/merged and have no entry).
 */
export function lookupStrongs(code: string): StrongsEntry | undefined {
  if (!code) return undefined;
  if (code.startsWith("H")) return hebrew[code];
  if (code.startsWith("G")) return greek[code];
  return undefined;
}

export function strongsLanguageLabel(code: string): "Hebrew" | "Greek" | null {
  if (code.startsWith("H")) return "Hebrew";
  if (code.startsWith("G")) return "Greek";
  return null;
}
