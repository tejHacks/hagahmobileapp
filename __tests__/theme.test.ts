import { palettes, resolveScheme, themeOrder, themes } from "../components/themes/theme";

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

it("offers only Match phone, Light and Dark", () => {
  expect(themeOrder).toEqual(["system", "light", "dark"]);
  expect(Object.keys(themes).sort()).toEqual(["dark", "light", "system"]);
});

it("follows the phone unless the user picks a look", () => {
  expect(resolveScheme("system", "dark")).toBe("dark");
  expect(resolveScheme("system", "light")).toBe("light");
  expect(resolveScheme("system", null)).toBe("light");
  expect(resolveScheme("light", "dark")).toBe("light");
  expect(resolveScheme("dark", "light")).toBe("dark");
});

describe.each(["light", "dark"] as const)("%s colours", (scheme) => {
  const c = palettes[scheme];
  it("text is readable (WCAG AA 4.5:1)", () => {
    for (const fg of [c.textPrimary, c.textSecondary, c.textMuted, c.accent, c.gold]) {
      expect(contrast(fg, c.bgBase)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(fg, c.bgElevated)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("buttons are readable", () => {
    expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
