/**
 * data/bible.ts
 * ---------------------------------------------------------------------------
 * KJV + Strong's-tagged Bible text, loaded on demand via SQLite.
 * ---------------------------------------------------------------------------
 */

import booksMeta from "../assets/bible/books.json";
import { getDb } from "../utils/database";

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

export const bibleBooks: BibleBookMeta[] = booksMeta as BibleBookMeta[];

export function getBookMeta(bookId: string): BibleBookMeta | undefined {
  return bibleBooks.find((b) => b.id === bookId);
}

const chapterCache = new Map<string, BibleChapter>();

function cacheKey(bookId: string, chapterNum: number) {
  return `${bookId}:${chapterNum}`;
}

export async function getChapterFromDb(
  bookId: string,
  chapterNum: number,
): Promise<BibleChapter> {
  const key = cacheKey(bookId, chapterNum);
  const cached = chapterCache.get(key);
  if (cached) {
    return cached;
  }

  const db = await getDb();
  const rows = await db.getAllAsync<{ verse: number; words_json: string }>(
    `SELECT verse, words_json FROM verses WHERE book = ? AND chapter = ? ORDER BY verse ASC`,
    [bookId, chapterNum],
  );

  const chapter: BibleChapter = {};
  for (const row of rows) {
    const words = JSON.parse(row.words_json) as BibleWord[];
    chapter[String(row.verse)] = {
      text: words.map((word) => word.t).join(" "),
      words,
    };
  }

  chapterCache.set(key, chapter);
  return chapter;
}

export async function getChapter(
  bookId: string,
  chapterNum: number,
): Promise<BibleChapter> {
  return getChapterFromDb(bookId, chapterNum);
}

export function prefetchChapter(bookId: string, chapterNum: number) {
  void getChapterFromDb(bookId, chapterNum).catch(() => {});
}

export function prefetchBook(bookId: string) {
  prefetchChapter(bookId, 1);
}

export async function searchAll(term: string): Promise<{book: string; chapter: number; verse: number; text: string}[]> {
  const db = await getDb();
  const like = `%${term}%`;
  const rows = await db.getAllAsync<{ book: string; chapter: number; verse: number; words_json: string }>(
    `SELECT book, chapter, verse, words_json FROM verses WHERE words_json LIKE ? COLLATE NOCASE LIMIT 200`,
    [like],
  );
  return rows.map((r) => {
    const words = JSON.parse(r.words_json) as { t: string }[];
    return { book: r.book, chapter: r.chapter, verse: r.verse, text: words.map((w) => w.t).join(" ") };
  });
}