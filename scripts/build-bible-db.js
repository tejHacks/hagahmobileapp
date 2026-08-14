const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const KJV_DIR = path.join(__dirname, "../assets/bible/kjv");
const OUT_PATH = path.join(__dirname, "../assets/bible/bible.db");

if (fs.existsSync(OUT_PATH)) fs.unlinkSync(OUT_PATH);

const db = new Database(OUT_PATH);

db.exec(`
  CREATE TABLE verses (
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    words_json TEXT NOT NULL
  );
  CREATE INDEX idx_book_chapter ON verses(book, chapter);
`);

const insert = db.prepare(
  `INSERT INTO verses (book, chapter, verse, words_json) VALUES (?, ?, ?, ?)`
);

const files = fs.readdirSync(KJV_DIR).filter((f) => f.endsWith(".bjson"));

const insertMany = db.transaction((bookId, chapters) => {
  for (const [chNum, chapter] of Object.entries(chapters)) {
    for (const [vNum, verse] of Object.entries(chapter)) {
      insert.run(bookId, Number(chNum), Number(vNum), JSON.stringify(verse.words));
    }
  }
});

for (const file of files) {
  const bookId = file.replace(".bjson", "");
  const raw = fs.readFileSync(path.join(KJV_DIR, file), "utf8");
  const data = JSON.parse(raw);
  insertMany(bookId, data.chapters);
  console.log(`Seeded ${bookId} (${Object.keys(data.chapters).length} chapters)`);
}

db.close();
console.log(`\nDone. Wrote ${OUT_PATH}`);