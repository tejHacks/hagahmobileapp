import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Declaration } from "../data/declarations";

const STORAGE_KEY = "hagah_bookmarks";

export type Bookmark = {
  id: number;
  declarationId: number;
  ref: string;
  scripture: string;
  declaration: string;
  createdAt: string;
};

async function readBookmarks(): Promise<Bookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

async function writeBookmarks(bookmarks: Bookmark[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export async function toggleBookmark(declaration: Declaration) {
  const bookmarks = await readBookmarks();
  const existing = bookmarks.find((item) => item.declarationId === declaration.id);

  if (existing) {
    const next = bookmarks.filter((item) => item.declarationId !== declaration.id);
    await writeBookmarks(next);
    return false;
  }

  const nextBookmark: Bookmark = {
    id: Date.now(),
    declarationId: declaration.id,
    ref: declaration.ref,
    scripture: declaration.scripture,
    declaration: declaration.declaration,
    createdAt: new Date().toISOString(),
  };

  const next = [nextBookmark, ...bookmarks];
  await writeBookmarks(next);
  return true;
}

export async function isBookmarked(declarationId: number) {
  const bookmarks = await readBookmarks();
  return bookmarks.some((item) => item.declarationId === declarationId);
}

export async function getBookmarks() {
  return readBookmarks();
}

export async function removeBookmark(declarationId: number) {
  const bookmarks = await readBookmarks();
  const next = bookmarks.filter((item) => item.declarationId !== declarationId);
  await writeBookmarks(next);
}
