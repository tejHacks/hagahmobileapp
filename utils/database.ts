import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

const DB_NAME = "bible.db";
const DB_VERSION = 2; // bump when build-bible-db.js output changes
const DB_VERSION_KEY = "hagah_bible_db_version";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function copyBundledDb(dbFileUri: string): Promise<void> {
  let asset: Asset;
  try {
    asset = Asset.fromModule(require("../assets/bible/bible.db") as number);
  } catch (reqErr) {
    console.error("Failed to require ../assets/bible/bible.db", reqErr);
    throw new Error(
      "Could not resolve ../assets/bible/bible.db. Run `npm run build-bible-db`, stop Metro, then restart."
    );
  }
  if (!asset.localUri) await asset.downloadAsync();
  const source = asset.localUri ?? asset.uri;
  if (!source) throw new Error("Unable to resolve bundled bible.db asset URI");

  await FileSystem.deleteAsync(dbFileUri, { idempotent: true });
  await FileSystem.copyAsync({ from: source, to: dbFileUri });

  const postInfo = await FileSystem.getInfoAsync(dbFileUri);
  if (!postInfo.exists) {
    throw new Error("bible.db copy reported missing right after copyAsync");
  }
  console.log("bible.db copied to", dbFileUri, "size", postInfo.size);
}

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
  const sqliteDir = `${docDir}SQLite`;

  try {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  } catch {
    // already exists
  }

  const dbFileUri = `${sqliteDir}/${DB_NAME}`;
  const info = await FileSystem.getInfoAsync(dbFileUri);
  const storedVersion = await AsyncStorage.getItem(DB_VERSION_KEY);
  const needsCopy = !info.exists || storedVersion !== String(DB_VERSION);

  if (needsCopy) {
    await copyBundledDb(dbFileUri);
    await AsyncStorage.setItem(DB_VERSION_KEY, String(DB_VERSION));
  }

  let db: SQLite.SQLiteDatabase;
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  } catch (err) {
    console.error("openDatabaseAsync failed, re-copying and retrying once", err);
    await copyBundledDb(dbFileUri);
    db = await SQLite.openDatabaseAsync(DB_NAME); // let this throw if still broken
  }

  try {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA temp_store = MEMORY;");
  } catch (pragmaErr) {
    console.warn("[Bible] Failed to set startup PRAGMAs", pragmaErr);
  }

  return db;
}

/**
 * THE FIX: every caller shares the same in-flight init promise instead of
 * each racing to call SQLite.openDatabaseAsync() independently. This is
 * what was corrupting the native handle under concurrent prefetch/open calls.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  if (!dbInitPromise) {
    dbInitPromise = initDb()
      .then((db) => {
        dbInstance = db;
        return db;
      })
      .catch((err) => {
        dbInitPromise = null; // let the next caller retry cleanly
        throw err;
      });
  }

  return dbInitPromise;
}

export async function resetDbInstanceForRetry(): Promise<void> {
  const old = dbInstance;
  dbInstance = null;
  dbInitPromise = null;
  if (old) {
    try {
      await old.closeAsync();
    } catch (e) {
      console.warn("[Bible] Failed to close stale db handle", e);
    }
  }
}

export async function ensureFtsExists(): Promise<void> {
  const db = await getDb();
  try {
    const existing = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='verses_fts'`
    );
    if (existing.length > 0) return; // already built by build-bible-db.js
    await db.execAsync(
      `CREATE VIRTUAL TABLE verses_fts USING fts5(book UNINDEXED, chapter UNINDEXED, verse UNINDEXED, text, content='verses', content_rowid='rowid')`
    );
    await db.execAsync(
      `INSERT INTO verses_fts(rowid, book, chapter, verse, text) SELECT rowid, book, chapter, verse, text FROM verses`
    );
  } catch (e) {
    console.warn("FTS setup failed", e);
  }
}