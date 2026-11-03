/**
 * data/bible.ts
 * ---------------------------------------------------------------------------
 * KJV + Strong's-tagged Bible text loaded from local SQLite.
 *
 * SQLite schema:
 *
 * verses (
 *   book TEXT,
 *   chapter INTEGER,
 *   verse INTEGER,
 *   text TEXT,
 *   words_json TEXT
 * )
 * verses_fts — FTS5 virtual table over verses.text, built by build-bible-db.js
 * ---------------------------------------------------------------------------
 */

import booksMeta from "../assets/bible/books.json";
import {
  getDb,
  resetDbInstanceForRetry,
} from "../utils/database";

export type BibleBookMeta = {
  id: string;
  name: string;
  chapters: number;
  versesLoaded: number;
};

export type BibleWord = {
  t: string;
  s?: string[];
  i?: boolean;
};

export type BibleVerse = {
  text: string;
  words: BibleWord[];
};

export type BibleChapter = Record<string, BibleVerse>;

type VerseRow = {
  verse: number;
  text: string | null;
  words_json: string;
};

type SearchRow = {
  book: string;
  chapter: number;
  verse: number;
  text: string | null;
  words_json: string;
};

export const bibleBooks: BibleBookMeta[] = booksMeta as BibleBookMeta[];

export function getBookMeta(bookId: string): BibleBookMeta | undefined {
  return bibleBooks.find((book) => book.id === bookId);
}

// ---------------------------------------------------------------------------
// Chapter cache
// ---------------------------------------------------------------------------

const chapterCache = new Map<string, BibleChapter>();
const CHAPTER_CACHE_LIMIT = 12;

function cacheKey(bookId: string, chapterNum: number): string {
  return `${bookId}:${chapterNum}`;
}

function parseWords(wordsJson: string | null | undefined): BibleWord[] {
  if (!wordsJson) return [];
  try {
    const parsed: unknown = JSON.parse(wordsJson);
    return Array.isArray(parsed) ? (parsed as BibleWord[]) : [];
  } catch {
    return [];
  }
}

function buildVerseText(
  text: string | null | undefined,
  words: BibleWord[],
): string {
  if (text && text.trim()) return text;
  return words.map((word) => word.t).join(" ").trim();
}

function cacheChapter(key: string, chapter: BibleChapter): void {
  chapterCache.delete(key);
  chapterCache.set(key, chapter);

  while (chapterCache.size > CHAPTER_CACHE_LIMIT) {
    const oldest = chapterCache.keys().next().value as string | undefined;
    if (!oldest) break;
    chapterCache.delete(oldest);
  }
}

// ---------------------------------------------------------------------------
// Chapter loading
// ---------------------------------------------------------------------------

export async function getChapterFromDb(
  bookId: string,
  chapterNum: number,
): Promise<BibleChapter> {
  const key = cacheKey(bookId, chapterNum);
  const cached = chapterCache.get(key);
  if (cached) return cached;

  const sql = `
    SELECT verse, text, words_json
    FROM verses
    WHERE book = ? AND chapter = ?
    ORDER BY verse ASC
  `;

  let rows: VerseRow[];

  try {
    const db = await getDb();
    rows = await db.getAllAsync<VerseRow>(sql, bookId, chapterNum);
  } catch (error) {
    console.error("[Bible] Chapter query failed:", { bookId, chapterNum, error });

    /*
     * The first failure can come from a stale/invalid native database
     * instance. Close and clear the cached JS reference, then retry ONCE.
     * getDb() re-serializes reopening via dbInitPromise, so concurrent
     * callers hitting this same failure won't race each other either.
     */
    await resetDbInstanceForRetry();

    try {
      const db = await getDb();
      rows = await db.getAllAsync<VerseRow>(sql, bookId, chapterNum);
    } catch (retryError) {
      console.error("[Bible] Chapter retry failed:", { bookId, chapterNum, retryError });
      throw retryError;
    }
  }

  const chapter: BibleChapter = {};

  for (const row of rows) {
    const words = parseWords(row.words_json);
    const text = buildVerseText(row.text, words);
    chapter[String(row.verse)] = { text, words };
  }

  cacheChapter(key, chapter);

  return chapter;
}

// ---------------------------------------------------------------------------
// Single verse
// ---------------------------------------------------------------------------

export async function getVerseTextFromDb(
  bookId: string,
  chapterNum: number,
  verseNum: number,
): Promise<string | null> {
  const sql = `
    SELECT text, words_json
    FROM verses
    WHERE book = ? AND chapter = ? AND verse = ?
    LIMIT 1
  `;

  try {
    const db = await getDb();

    const rows = await db.getAllAsync<{
      text: string | null;
      words_json: string;
    }>(sql, bookId, chapterNum, verseNum);

    const row = rows[0];
    if (!row) return null;

    const words = parseWords(row.words_json);
    const text = buildVerseText(row.text, words);

    return text || null;
  } catch (error) {
    console.error("[Bible] Verse query failed:", { bookId, chapterNum, verseNum, error });

    // Same stale-handle recovery path as getChapterFromDb.
    await resetDbInstanceForRetry();

    try {
      const db = await getDb();
      const rows = await db.getAllAsync<{
        text: string | null;
        words_json: string;
      }>(sql, bookId, chapterNum, verseNum);

      const row = rows[0];
      if (!row) return null;

      const words = parseWords(row.words_json);
      const text = buildVerseText(row.text, words);
      return text || null;
    } catch (retryError) {
      console.error("[Bible] Verse retry failed:", { bookId, chapterNum, verseNum, retryError });
      throw retryError;
    }
  }
}

// ---------------------------------------------------------------------------
// Public aliases
// ---------------------------------------------------------------------------

export async function getChapter(bookId: string, chapterNum: number): Promise<BibleChapter> {
  return getChapterFromDb(bookId, chapterNum);
}

export function prefetchChapter(bookId: string, chapterNum: number): void {
  void getChapterFromDb(bookId, chapterNum).catch((error) => {
    console.warn("[Bible] Prefetch failed:", { bookId, chapterNum, error });
  });
}

export function prefetchBook(bookId: string): void {
  prefetchChapter(bookId, 1);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
// Uses the verses_fts FTS5 table (built once, at DB-build time, in
// build-bible-db.js) instead of `text LIKE '%term%'`. A leading-wildcard
// LIKE can't use any index and forces a full scan + collation on every
// row; FTS5 uses a proper inverted index and is dramatically faster on
// 31k+ rows. Falls back to LIKE only if an old cached on-device DB (built
// before FTS existed) is missing the table.

export async function searchAll(
  term: string,
): Promise<{ book: string; chapter: number; verse: number; text: string }[]> {
  const cleaned = term.trim();
  if (!cleaned) return [];

  const db = await getDb();

  const ftsQuery = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `"${w.replace(/"/g, '""')}"*`)
    .join(" ");

  let rows: SearchRow[];

  try {
    rows = await db.getAllAsync<SearchRow>(
      `
      SELECT v.book, v.chapter, v.verse, v.text, v.words_json
      FROM verses_fts f
      JOIN verses v ON v.rowid = f.rowid
      WHERE verses_fts MATCH ?
      ORDER BY rank
      LIMIT 200
      `,
      ftsQuery,
    );
  } catch (error) {
    console.warn("[Bible] FTS search failed, falling back to LIKE:", { term: cleaned, error });

    try {
      const like = `%${cleaned}%`;
      rows = await db.getAllAsync<SearchRow>(
        `
        SELECT book, chapter, verse, text, words_json
        FROM verses
        WHERE text LIKE ? COLLATE NOCASE
        ORDER BY book, chapter, verse
        LIMIT 200
        `,
        like,
      );
    } catch (fallbackError) {
      console.error("[Bible] Search failed:", { term: cleaned, fallbackError });
      throw fallbackError;
    }
  }

  return rows.map((row) => {
    const words = parseWords(row.words_json);
    return {
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: buildVerseText(row.text, words),
    };
  });
}