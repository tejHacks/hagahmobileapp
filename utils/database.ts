import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

const DB_NAME = "bible.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
  const sqliteDir = `${docDir}SQLite`;
  try {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  } catch {
    // ignore if it already exists
  }

  const dbFileUri = `${sqliteDir}/${DB_NAME}`;
  const info = await FileSystem.getInfoAsync(dbFileUri);
  if (!info.exists) {
    const asset = Asset.fromModule(require("../assets/bible/bible.db") as number);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const source = asset.localUri ?? asset.uri;
    if (!source) throw new Error("Unable to resolve bundled bible.db asset URI");
    await FileSystem.copyAsync({ from: source, to: dbFileUri });
  }

  // Modern expo-sqlite async API — no .transaction()/.executeSql() wrapper needed.
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

  return dbInstance;
}

export async function ensureFtsExists(): Promise<void> {
  const db = await getDb();
  try {
    await db.execAsync(
      `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(book, chapter, verse, words_json, content='verses', content_rowid='rowid')`
    );
    try {
      await db.execAsync(
        `INSERT INTO verses_fts(rowid, book, chapter, verse, words_json) SELECT rowid, book, chapter, verse, words_json FROM verses WHERE rowid NOT IN (SELECT rowid FROM verses_fts)`
      );
    } catch (e) {
      console.warn("FTS populate failed", e);
    }
  } catch (e) {
    console.warn("FTS create failed", e);
  }
}