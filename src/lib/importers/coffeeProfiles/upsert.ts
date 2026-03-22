import type { SupabaseClient } from "@supabase/supabase-js";

import type { CoffeeProfileInsert } from "./types";

export function dedupeBySlug(rows: CoffeeProfileInsert[]): CoffeeProfileInsert[] {
  const map = new Map<string, CoffeeProfileInsert>();
  for (const row of rows) {
    map.set(row.slug, row);
  }
  return [...map.values()];
}

export async function upsertCoffeeProfilesBatch(
  client: SupabaseClient,
  rows: CoffeeProfileInsert[],
): Promise<void> {
  if (rows.length === 0) return;

  const payload = rows.map((r) => ({
    slug: r.slug,
    display_name: r.display_name,
    description: r.description,
    flavor_notes: r.flavor_notes,
    metadata: r.metadata,
    variety_ru: r.variety_ru,
    processing_ru: r.processing_ru,
    roast_level_ru: r.roast_level_ru,
    flavor_notes_ru: r.flavor_notes_ru,
    texture_tags_ru: r.texture_tags_ru,
    mood_tags_ru: r.mood_tags_ru,
    description_ru: r.description_ru,
  }));

  const { error } = await client.from("coffee_profiles").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    throw new Error(`coffee_profiles upsert: ${error.message}`);
  }
}
