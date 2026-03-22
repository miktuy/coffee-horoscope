import { describe, expect, it } from "vitest";

import { extractFlavorNotesFromProse, extractSensoryFlavorNotesEn, isNonSensoryFlavorChip } from "./notes";
import { slugFromCqiId, slugFromString } from "./slug";
import { cqiRowToProfile } from "./transformCqi";
import { coffeeReviewRowToProfile } from "./transformCoffeeReview";

describe("slugFromString / slugFromCqiId", () => {
  it("creates stable hashed slugs", () => {
    expect(slugFromString("cr", "https://a.example/x")).toBe(
      slugFromString("cr", "https://a.example/x"),
    );
    expect(slugFromString("cr", "https://a.example/x")).not.toBe(
      slugFromString("cr", "https://a.example/y"),
    );
  });

  it("normalizes CQI ids", () => {
    expect(slugFromCqiId("123")).toBe("cqi-123");
    expect(slugFromCqiId("AB CD")).toBe("cqi-ab-cd");
  });
});

describe("extractFlavorNotesFromProse", () => {
  it("splits on commas and semicolons", () => {
    const notes = extractFlavorNotesFromProse("caramel, milk chocolate; citrus zest");
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes.some((n) => n.toLowerCase().includes("caramel"))).toBe(true);
  });
});

describe("extractSensoryFlavorNotesEn", () => {
  it("drops processing / variety chips", () => {
    expect(isNonSensoryFlavorChip("washed process")).toBe(true);
    expect(isNonSensoryFlavorChip("Heirloom")).toBe(true);
    const notes = extractSensoryFlavorNotesEn(
      "Sweet caramel, natural process, citrus zest",
      "Bourbon variety",
    );
    expect(notes.some((n) => /caramel/i.test(n))).toBe(true);
    expect(notes.some((n) => /washed|natural|bourbon|heirloom/i.test(n))).toBe(false);
  });
});

describe("coffeeReviewRowToProfile", () => {
  it("maps a minimal review row", () => {
    const row: Record<string, string> = {
      URL: "https://coffeereview.com/review/test",
      "Coffee Name": "Test Blend",
      Roaster: "Acme",
      "Blind Assessment": "Sweet, nutty, balanced",
      "Bottom Line": "A solid daily drinker.",
      "Coffee Origin": "Colombia",
      "Roast Level": "Medium",
      Agtron: "55 / 60",
      "Review Date": "2024-01-01",
      Rating: "93",
    };
    const p = coffeeReviewRowToProfile(row);
    expect(p).not.toBeNull();
    expect(p?.display_name).toContain("Test Blend");
    expect(p?.metadata.source).toBe("coffee_review");
    expect(p?.flavor_notes.length).toBeGreaterThan(0);
    expect(p?.flavor_notes_ru.length).toBeGreaterThan(0);
    expect(p?.texture_tags_ru.length).toBeGreaterThan(0);
    expect(p?.mood_tags_ru.length).toBeGreaterThanOrEqual(2);
    expect(p?.mood_tags_ru.length).toBeLessThanOrEqual(3);
    expect(p?.description_ru).toBeTruthy();
    expect(p?.description_ru).toContain("Колумбии");
    expect(p?.mood_tags_ru).not.toContain("обзорный стиль");
  });

  it("returns null without URL", () => {
    expect(coffeeReviewRowToProfile({ "Coffee Name": "x" })).toBeNull();
  });
});

describe("cqiRowToProfile", () => {
  it("maps a minimal CQI row", () => {
    const row: Record<string, string> = {
      ID: "42",
      "Country of Origin": "Ethiopia",
      Region: "Sidama",
      "Farm Name": "Test Farm",
      Variety: "Heirloom",
      "Processing Method": "Washed",
      Aroma: "8.1",
      Flavor: "8.2",
      Acidity: "8.0",
      Body: "8.0",
      Balance: "8.0",
      Uniformity: "10",
      "Clean Cup": "10",
      Sweetness: "10",
      "Total Cup Points": "86.5",
    };
    const p = cqiRowToProfile(row);
    expect(p).not.toBeNull();
    expect(p?.slug).toBe("cqi-42");
    expect(p?.metadata.source).toBe("cqi");
    expect(p?.metadata.country_of_origin).toBe("Ethiopia");
    expect(p?.flavor_notes).toEqual([]);
    expect(p?.processing_ru).toBe("мытая");
    expect(p?.variety_ru).toBe("местные сорта");
    expect(p?.mood_tags_ru.length).toBeGreaterThan(0);
    expect(p?.description_ru).toMatch(/Эфиопи/);
  });
});
