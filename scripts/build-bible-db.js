const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const KJV_DIR = path.join(__dirname, "../assets/bible/kjv");
const BOOKS_JSON_PATH = path.join(__dirname, "../assets/bible/books.json");
const OUT_PATH = path.join(__dirname, "../assets/bible/bible.db");

if (!fs.existsSync(BOOKS_JSON_PATH)) {
  throw new Error(`Missing ${BOOKS_JSON_PATH} — this is required for canonical book order/names.`);
}
const booksMeta = JSON.parse(fs.readFileSync(BOOKS_JSON_PATH, "utf8"));

// books.json is already in canonical Bible order, so its array index IS the
// order we want. id (e.g. "Gen") matches the .bjson filename minus extension.
const bookInfoById = new Map(
  booksMeta.map((b, index) => [b.id, { order: index, name: b.name, expectedChapters: b.chapters }])
);

if (fs.existsSync(OUT_PATH)) fs.unlinkSync(OUT_PATH);
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

const db = new Database(OUT_PATH);

// Speed up bulk insert during build — this file is discarded after, so
// durability guarantees don't matter here, only final output correctness.
db.pragma("journal_mode = MEMORY");
db.pragma("synchronous = OFF");

db.exec(`
  CREATE TABLE verses (
    book TEXT NOT NULL,
    book_name TEXT NOT NULL,
    book_order INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT,
    words_json TEXT NOT NULL
  );
  CREATE INDEX idx_book_chapter ON verses(book, chapter);
  CREATE INDEX idx_book_chapter_verse ON verses(book, chapter, verse);
  CREATE INDEX idx_book_order ON verses(book_order);
`);

const insert = db.prepare(
  `INSERT INTO verses (book, book_name, book_order, chapter, verse, text, words_json) VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const files = fs.readdirSync(KJV_DIR).filter((f) => f.endsWith(".bjson"));

const insertMany = db.transaction((bookId, bookName, order, chapters) => {
  for (const [chNum, chapter] of Object.entries(chapters)) {
    for (const [vNum, verse] of Object.entries(chapter)) {
      const words = verse.words || [];
      const text = verse.text || (words.length ? words.map((w) => w.t).join(" ") : null);
      insert.run(bookId, bookName, order, Number(chNum), Number(vNum), text, JSON.stringify(words));
    }
  }
});

let seededBooks = 0;
let seededChapters = 0;
let unmapped = 0;
const chapterMismatches = []; // { bookId, name, expected, actual }

for (const file of files) {
  const bookId = file.replace(".bjson", "");
  const info = bookInfoById.get(bookId);

  if (!info) {
    console.warn(`⚠️  "${bookId}" not found in books.json — skipping. Check the id matches exactly (case-sensitive).`);
    unmapped++;
    continue;
  }

  let data;
  try {
    const raw = fs.readFileSync(path.join(KJV_DIR, file), "utf8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ Skipping ${bookId} — failed to read/parse: ${err.message}`);
    continue;
  }

  try {
    insertMany(bookId, info.name, info.order, data.chapters);
    const chCount = Object.keys(data.chapters).length;
    seededChapters += chCount;
    seededBooks++;

    if (chCount !== info.expectedChapters) {
      chapterMismatches.push({ bookId, name: info.name, expected: info.expectedChapters, actual: chCount });
      console.log(`✓ Seeded ${bookId} — ${info.name} (${chCount} chapters)  ⚠️ expected ${info.expectedChapters}`);
    } else {
      console.log(`✓ Seeded ${bookId} — ${info.name} (${chCount} chapters)`);
    }
  } catch (err) {
    console.error(`✗ Skipping ${bookId} — insert failed: ${err.message}`);
  }
}

// Build FTS5 at build time instead of on first app launch — the shipped
// bible.db is already fully indexed, so ensureFtsExists() on the client
// becomes a no-op the first time it runs.
console.log("\nBuilding FTS5 index...");
db.exec(`
  CREATE VIRTUAL TABLE verses_fts USING fts5(
    book, chapter, verse, words_json, content='verses', content_rowid='rowid'
  );
  INSERT INTO verses_fts(rowid, book, chapter, verse, words_json)
    SELECT rowid, book, chapter, verse, words_json FROM verses;
`);

// Restore safe defaults, then shrink and optimize the file before it ships.
db.pragma("journal_mode = DELETE");
db.pragma("synchronous = FULL");
db.exec("PRAGMA optimize;");
db.exec("VACUUM;");

db.close();

console.log(`\nDone. Wrote ${OUT_PATH}`);
console.log(`Total: ${seededBooks}/${booksMeta.length} books seeded, ${seededChapters} chapters.`);
if (unmapped) console.log(`${unmapped} file(s) in kjv/ had no matching id in books.json — see warnings above.`);
if (seededBooks < booksMeta.length - unmapped) console.log(`Note: some books.json entries had no matching .bjson file.`);

if (chapterMismatches.length) {
  console.log("\n==================== ⚠️  DATA WARNING ====================");
  console.log("The following books were seeded with a DIFFERENT chapter count");
  console.log("than books.json expects. This usually means the .bjson source");
  console.log("file has the WRONG book's content under that filename — fix");
  console.log("the source file(s) below, then rerun this script.");
  console.log("------------------------------------------------------------");
  for (const m of chapterMismatches) {
    console.log(`  kjv/${m.bookId}.bjson — labeled "${m.name}", expected ${m.expected} chapter(s), got ${m.actual}`);
  }
  console.log("============================================================\n");
}