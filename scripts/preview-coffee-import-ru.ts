/**
 * Preview 10 polished coffee_profiles (5 CQI + 5 CoffeeReview): EN source + RU normalization.
 * Does not read env or touch the database.
 *
 *   npm run preview:coffee-import-ru
 */

import { createReadStream, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse";
import { parse as parseSync } from "csv-parse/sync";

import { cqiRowToProfile } from "@/lib/importers/coffeeProfiles/transformCqi";
import { coffeeReviewRowToProfile } from "@/lib/importers/coffeeProfiles/transformCoffeeReview";
import type { CoffeeProfileInsert } from "@/lib/importers/coffeeProfiles/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

type PreviewRecord = {
  slug: string;
  source: string;
  original: {
    display_name: string;
    description: string | null;
    flavor_notes: string[];
  };
  russian: {
    variety_ru: string | null;
    processing_ru: string | null;
    roast_level_ru: string | null;
    flavor_notes_ru: string[];
    texture_tags_ru: string[];
    mood_tags_ru: string[];
    description_ru: string | null;
  };
};

function toPreview(p: CoffeeProfileInsert, source: string): PreviewRecord {
  return {
    slug: p.slug,
    source,
    original: {
      display_name: p.display_name,
      description: p.description,
      flavor_notes: p.flavor_notes,
    },
    russian: {
      variety_ru: p.variety_ru,
      processing_ru: p.processing_ru,
      roast_level_ru: p.roast_level_ru,
      flavor_notes_ru: p.flavor_notes_ru,
      texture_tags_ru: p.texture_tags_ru,
      mood_tags_ru: p.mood_tags_ru,
      description_ru: p.description_ru,
    },
  };
}

function loadCqiSamples(csvPath: string, count: number): PreviewRecord[] {
  const text = readFileSync(csvPath, "utf8");
  const rows = parseSync(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  }) as Record<string, string>[];

  const out: PreviewRecord[] = [];
  for (const row of rows) {
    const p = cqiRowToProfile(row);
    if (!p) continue;
    out.push(toPreview(p, "cqi"));
    if (out.length >= count) break;
  }
  return out;
}

async function loadReviewSamples(
  csvPath: string,
  count: number,
): Promise<PreviewRecord[]> {
  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true,
    }),
  );

  const out: PreviewRecord[] = [];
  for await (const row of parser) {
    const p = coffeeReviewRowToProfile(row as Record<string, string>);
    if (!p) continue;
    out.push(toPreview(p, "coffee_review"));
    if (out.length >= count) break;
  }
  return out;
}

async function main() {
  const cqiPath =
    process.env.CQI_CSV ?? path.join(ROOT, "data/raw/kaggle/coffee-quality-cqi/df_arabica_clean.csv");
  const reviewsPath =
    process.env.COFFEE_REVIEWS_CSV ??
    path.join(ROOT, "data/raw/kaggle/coffee-reviews/coffee_reviews_parsed.csv");

  if (!existsSync(cqiPath)) {
    console.error(`Missing CQI CSV: ${cqiPath}`);
    process.exit(1);
  }
  if (!existsSync(reviewsPath)) {
    console.error(`Missing reviews CSV: ${reviewsPath}`);
    process.exit(1);
  }

  const cqi = loadCqiSamples(cqiPath, 5);
  const reviews = await loadReviewSamples(reviewsPath, 5);
  const combined = [...cqi, ...reviews];

  console.log(JSON.stringify({ count: combined.length, records: combined }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
