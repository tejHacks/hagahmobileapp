import { declarations } from "../data/declarations";
import { scriptureDeclarations, scriptureThemes } from "../data/scripture_declarations";
import { speakable } from "../utils/speech";

describe("scripture declarations (KJV, word for word)", () => {
  it("has declarations for every theme", () => {
    expect(scriptureDeclarations.length).toBeGreaterThanOrEqual(60);
    for (const t of scriptureThemes) {
      expect(scriptureDeclarations.filter((d) => d.theme === t).length).toBeGreaterThanOrEqual(5);
    }
  });

  it("are spoken in the first person", () => {
    for (const d of scriptureDeclarations) expect(d.text).toMatch(/\b(I|me|my|mine|we|us|our)\b/);
  });

  it("carry no headings, markers or missing endings", () => {
    for (const d of scriptureDeclarations) {
      expect(d.text).not.toMatch(/\[\[|➔|\[fn\]/);
      expect(d.text).toMatch(/[.;:,?!)]$/);
    }
  });

  it("quote the verses exactly", () => {
    const find = (ref: string) => scriptureDeclarations.find((d) => d.ref === ref)?.text;
    expect(find("Psalm 23:1")).toBe("The LORD is my shepherd; I shall not want.");
    expect(find("Psalm 56:3")).toBe("What time I am afraid, I will trust in thee.");
    expect(find("Philippians 4:13")).toBe("I can do all things through Christ which strengtheneth me.");
  });
});

describe("daily declarations", () => {
  it("use real KJV text for their scripture", () => {
    expect(declarations.length).toBeGreaterThan(200);
    for (const d of declarations) {
      // phrasing from the old paraphrases, never found in the KJV
      expect(d.scripture).not.toMatch(/\bthee (will|may)\b|declares the LORD|\bLet Us make\b/);
    }
    expect(declarations.find((d) => d.ref === "Jeremiah 29:11")?.scripture).toMatch(/^For I know the thoughts that I think toward you, saith the LORD/);
  });
});

describe("read aloud", () => {
  it("says LORD and GOD as words instead of spelling them out", () => {
    expect(speakable("The LORD is my shepherd")).toBe("The Lord is my shepherd");
    expect(speakable("the Lord GOD will help me")).toBe("the Lord God will help me");
    expect(speakable("[[A Psalm of David.]] The LORD'S")).toBe("The Lord's");
  });
});
