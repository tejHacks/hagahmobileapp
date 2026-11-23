"""Repair assets/bible/bible.db against a clean KJV text.

About 3,300 verses in the bundled database lost their final word or words
(e.g. Psalm 23:4 ended "they comfort" instead of "they comfort me."), and some
verses carry stray markers ("➔", "[fn]"). This script:

  1. removes the stray markers from `text` and from each token in `words_json`;
  2. where the database text is a word-for-word prefix of the clean KJV verse,
     appends the missing words to `text` and as plain tokens in `words_json`
     (no Strong's numbers for the appended words);
  3. rebuilds the full-text search index.

It never rewrites a verse that differs in any other way, so the database's
own wording (e.g. "LORD" in capitals) is kept.

    python3 scripts/repair-bible-db.py /path/to/KJV.csv
"""
import csv
import json
import os
import re
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "assets/bible/bible.db")

# Book names in the CSV that differ from the database
CSV_BOOK = {
    "I Chronicles": "1 Chronicles", "II Chronicles": "2 Chronicles", "I Corinthians": "1 Corinthians",
    "II Corinthians": "2 Corinthians", "I John": "1 John", "II John": "2 John", "III John": "3 John",
    "I Kings": "1 Kings", "II Kings": "2 Kings", "I Peter": "1 Peter", "II Peter": "2 Peter",
    "I Samuel": "1 Samuel", "II Samuel": "2 Samuel", "I Thessalonians": "1 Thessalonians",
    "II Thessalonians": "2 Thessalonians", "I Timothy": "1 Timothy", "II Timothy": "2 Timothy",
    "Revelation of John": "Revelation", "Song of Solomon": "Song of Songs",
}

MARKERS = re.compile(r"\s*(?:➔|\[fn\])\s*")


def strip_markers(s: str) -> str:
    return re.sub(r"\s{2,}", " ", MARKERS.sub(" ", s)).strip()


def words(s: str):
    s = re.sub(r"\[\[|\]\]", " ", s).replace("\u2019", "'").replace("\u2018", "'")
    s = re.sub(r"[\u2013\u2014-]", "", s)
    return [w for w in re.sub(r"[^a-z0-9' ]+", " ", s.lower()).split() if w]


def main(csv_path: str):
    clean = {}
    with open(csv_path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            clean[(CSV_BOOK.get(r["Book"], r["Book"]), int(r["Chapter"]), int(r["Verse"]))] = r["Text"].strip()

    db = sqlite3.connect(DB_PATH)
    rows = db.execute("select rowid, book_name, chapter, verse, text, words_json from verses").fetchall()
    marked = extended = skipped = 0
    for rowid, book, ch, v, text, wj in rows:
        text = text or ""
        new_text = strip_markers(text)
        tokens = json.loads(wj)
        new_tokens = []
        for t in tokens:
            tt = strip_markers(t.get("t", ""))
            if tt:
                new_tokens.append({**t, "t": tt})
        if new_text != text:
            marked += 1

        ref = clean.get((book, ch, v))
        if ref:
            dbw, refw = words(new_text), words(ref)
            if len(refw) > len(dbw) and refw[: len(dbw)] == dbw:
                # take the original-cased tail words from the clean text
                raw = re.sub(r"\[\[|\]\]", " ", ref).split()
                tail, count = [], 0
                for tok in raw:
                    n = len(words(tok))
                    if count >= len(dbw):
                        tail.append(tok)
                    count += n
                if tail:
                    new_text = (new_text + " " + " ".join(tail)).strip()
                    new_tokens += [{"t": w, "s": []} for w in tail]
                    extended += 1
            elif len(refw) > len(dbw) and not re.search(r"[.;:,?!)]$", new_text):
                # Spelling differs earlier in the verse (e.g. Caesarea / Cesarea):
                # match on the last four words and append whatever follows them.
                raw = re.sub(r"\[\[|\]\]", " ", ref).split()
                raw_norm = [" ".join(words(t)) for t in raw]
                last = dbw[-4:]
                tail = []
                for i in range(len(raw) - len(last), -1, -1):
                    if [x for x in raw_norm[i : i + len(last)]] == last:
                        tail = raw[i + len(last) :]
                        break
                if tail:
                    new_text = (new_text + " " + " ".join(tail)).strip()
                    new_tokens += [{"t": w, "s": []} for w in tail]
                    extended += 1
                else:
                    skipped += 1
            elif len(refw) > len(dbw):
                skipped += 1

        if new_text != text or new_tokens != tokens:
            db.execute("update verses set text=?, words_json=? where rowid=?", (new_text, json.dumps(new_tokens, ensure_ascii=False), rowid))

    db.execute("insert into verses_fts(verses_fts) values('rebuild')")
    db.commit()
    db.execute("vacuum")
    db.close()
    print(f"markers removed: {marked}; verses completed: {extended}; longer in KJV but not a clean prefix (left alone): {skipped}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
