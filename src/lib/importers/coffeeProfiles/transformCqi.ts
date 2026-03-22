import { buildRussianProfile } from "./ru/buildRussianProfile";
import type { CoffeeProfileInsert } from "./types";
import { slugFromCqiId } from "./slug";

type RawRow = Record<string, string>;

function pick(row: RawRow, key: string): string | undefined {
  const v = row[key];
  return v === undefined || v === "" ? undefined : v;
}

function num(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Maps a row from CQI `df_arabica_clean.csv` to a `coffee_profiles` insert.
 * @see https://www.kaggle.com/datasets/fatihb/coffee-quality-data-cqi
 */
export function cqiRowToProfile(
  row: RawRow,
  options?: { descriptionMaxLength?: number },
): CoffeeProfileInsert | null {
  const id = pick(row, "ID");
  if (id === undefined) return null;

  const country = pick(row, "Country of Origin");
  const region = pick(row, "Region");
  const variety = pick(row, "Variety");
  const farm = pick(row, "Farm Name");
  const processing = pick(row, "Processing Method");

  const displayParts = [variety, farm, region, country].filter(Boolean);
  const display_name =
    displayParts.length > 0
      ? displayParts.join(" · ")
      : `CQI lot ${id}`;

  const maxLen = options?.descriptionMaxLength ?? 2000;
  const proseParts = [
    farm && `Farm: ${farm}`,
    processing && `Processing: ${processing}`,
    pick(row, "Producer") && `Producer: ${pick(row, "Producer")}`,
  ].filter(Boolean) as string[];

  let description = proseParts.join(". ") || null;
  if (description && description.length > maxLen) {
    description = `${description.slice(0, maxLen - 1)}…`;
  }

  /** English chips: sensory-only; CQI CSV has no blind prose — Russian layer infers from scores. */
  const flavor_notes: string[] = [];

  const metadata: Record<string, unknown> = {
    source: "cqi",
    cqi_id: id,
    country_of_origin: country ?? null,
    region: region ?? null,
    farm_name: farm ?? null,
    lot_number: pick(row, "Lot Number") ?? null,
    mill: pick(row, "Mill") ?? null,
    altitude: pick(row, "Altitude") ?? null,
    variety: variety ?? null,
    processing_method: processing ?? null,
    producer: pick(row, "Producer") ?? null,
    harvest_year: pick(row, "Harvest Year") ?? null,
    grading_date: pick(row, "Grading Date") ?? null,
    aroma: num(pick(row, "Aroma")),
    flavor: num(pick(row, "Flavor")),
    aftertaste: num(pick(row, "Aftertaste")),
    acidity: num(pick(row, "Acidity")),
    body: num(pick(row, "Body")),
    balance: num(pick(row, "Balance")),
    uniformity: num(pick(row, "Uniformity")),
    clean_cup: num(pick(row, "Clean Cup")),
    sweetness: num(pick(row, "Sweetness")),
    total_cup_points: num(pick(row, "Total Cup Points")),
    moisture_percentage: num(pick(row, "Moisture Percentage")),
    defects: num(pick(row, "Defects")),
  };

  const core = {
    slug: slugFromCqiId(id),
    display_name,
    description,
    flavor_notes: flavor_notes.slice(0, 20),
    metadata,
  };
  return buildRussianProfile(core);
}
