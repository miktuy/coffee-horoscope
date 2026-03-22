import { describe, expect, it } from "vitest";

import { getZodiacSignById, ZODIAC_SIGNS, type ZodiacSign } from "./zodiac";

describe("ZODIAC_SIGNS", () => {
  it("contains exactly twelve signs", () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
  });

  it("has unique ids", () => {
    const ids = ZODIAC_SIGNS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique symbols", () => {
    const symbols = ZODIAC_SIGNS.map((s) => s.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("each sign has non-empty required fields", () => {
    const keys: (keyof ZodiacSign)[] = [
      "id",
      "name",
      "symbol",
      "dateRange",
      "coffeePick",
      "reading",
    ];
    for (const sign of ZODIAC_SIGNS) {
      for (const key of keys) {
        expect(sign[key].length, `${sign.id}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("uses expected western zodiac ids in order", () => {
    expect(ZODIAC_SIGNS.map((s) => s.id)).toEqual([
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ]);
  });
});

describe("getZodiacSignById", () => {
  it("returns the matching sign", () => {
    const virgo = getZodiacSignById("virgo");
    expect(virgo).toBeDefined();
    expect(virgo?.name).toBe("Дева");
    expect(virgo?.symbol).toBe("♍");
  });

  it("returns undefined for unknown id", () => {
    expect(getZodiacSignById("unknown")).toBeUndefined();
  });

  it("returns undefined for empty id", () => {
    expect(getZodiacSignById("")).toBeUndefined();
  });
});
