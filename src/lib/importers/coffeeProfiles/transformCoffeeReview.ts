import { buildRussianProfile } from "./ru/buildRussianProfile";
import type { CoffeeProfileInsert } from "./types";
import { extractSensoryFlavorNotesEn } from "./notes";
import { slugFromString } from "./slug";

type RawRow = Record<string, string>;

function num(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pick(row: RawRow, key: string): string | undefined {
  const v = row[key];
  return v === undefined || v === "" ? undefined : v;
}

function joinDescription(
  blind: string | undefined,
  bottom: string | undefined,
  maxLen: number,
): string | null {
  const parts = [blind, bottom].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  const text = parts.join("\n\n").trim();
  if (!text) return null;
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

/**
 * Maps a row from `coffee_reviews_parsed.csv` to a `coffee_profiles` insert.
 * @see https://www.kaggle.com/datasets/xinowo/coffee-reviews-feb-1997-mar-2025
 */
export function coffeeReviewRowToProfile(
  row: RawRow,
  options?: { descriptionMaxLength?: number },
): CoffeeProfileInsert | null {
  const url = pick(row, "URL");
  if (!url) return null;

  const coffeeName = pick(row, "Coffee Name") ?? "Unknown coffee";
  const roaster = pick(row, "Roaster");
  const display_name = roaster ? `${coffeeName} (${roaster})` : coffeeName;

  const maxLen = options?.descriptionMaxLength ?? 4000;
  const description = joinDescription(
    pick(row, "Blind Assessment"),
    pick(row, "Bottom Line"),
    maxLen,
  );

  const blind = pick(row, "Blind Assessment");
  const notes = pick(row, "Notes");
  const flavor_notes = extractSensoryFlavorNotesEn(blind, notes);

  const metadata: Record<string, unknown> = {
    source: "coffee_review",
    blind_assessment: blind ?? null,
    notes_text: notes ?? null,
    url,
    roaster: roaster ?? null,
    coffee_name: pick(row, "Coffee Name") ?? null,
    roaster_location: pick(row, "Roaster Location") ?? null,
    coffee_origin: pick(row, "Coffee Origin") ?? null,
    roast_level: pick(row, "Roast Level") ?? null,
    agtron: pick(row, "Agtron") ?? null,
    est_price: pick(row, "Est. Price") ?? null,
    review_date: pick(row, "Review Date") ?? null,
    rating: num(pick(row, "Rating")),
    aroma: num(pick(row, "Aroma")),
    acidity: num(pick(row, "Acidity")),
    acidity_structure: num(pick(row, "Acidity/Structure")),
    body: num(pick(row, "Body")),
    flavor: num(pick(row, "Flavor")),
    aftertaste: num(pick(row, "Aftertaste")),
    with_milk: num(pick(row, "With Milk")),
  };

  const core = {
    slug: slugFromString("cr", url),
    display_name,
    description,
    flavor_notes: flavor_notes.slice(0, 24),
    metadata,
  };
  return buildRussianProfile(core);
}
