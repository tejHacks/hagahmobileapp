import { bibleBooks, bibleSections, plainVerseText, splitVerseTitle } from "../data/bible";

jest.mock("../utils/database", () => ({ getDb: jest.fn(), resetDbInstanceForRetry: jest.fn() }));

describe("Bible data", () => {
  it("has all 66 books in canonical order", () => {
    expect(bibleBooks).toHaveLength(66);
    expect(bibleBooks[0].name).toBe("Genesis");
    expect(bibleBooks[65].name).toBe("Revelation");
  });

  it("groups every book into exactly one section", () => {
    const ids = bibleSections.flatMap((s) => s.books.map((b) => b.id));
    expect(ids).toEqual(bibleBooks.map((b) => b.id));
    expect(bibleSections.filter((s) => s.testament === "ot").flatMap((s) => s.books)).toHaveLength(39);
    expect(bibleSections.filter((s) => s.testament === "nt").flatMap((s) => s.books)).toHaveLength(27);
  });

  it("lifts a psalm title out of verse 1", () => {
    const { title, body } = splitVerseTitle([
      { t: "[[A" }, { t: "Psalm", s: ["H4210"] }, { t: "of" }, { t: "David.]]", s: ["H1732"] },
      { t: "The" }, { t: "LORD", s: ["H3068"] }, { t: "is", i: true }, { t: "my" }, { t: "shepherd;" },
    ]);
    expect(title).toBe("A Psalm of David.");
    expect(body.map((w) => w.t).join(" ")).toBe("The LORD is my shepherd;");
  });

  it("leaves ordinary verses alone", () => {
    const words = [{ t: "Jesus", s: ["G2424"] }, { t: "wept." }];
    expect(splitVerseTitle(words)).toEqual({ title: null, body: words });
  });

  it("strips title markup from plain text", () => {
    expect(plainVerseText("[[A Psalm of David.]] The LORD is my shepherd; I shall not want."))
      .toBe("The LORD is my shepherd; I shall not want.");
  });
});
