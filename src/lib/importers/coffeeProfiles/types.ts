/**
 * Row shape for inserting into `public.coffee_profiles` (id/timestamps from DB).
 * English-facing fields come from CSV transforms; Russian fields from dictionaries + templates.
 */
export type CoffeeProfileCore = {
  slug: string;
  display_name: string;
  description: string | null;
  flavor_notes: string[];
  metadata: Record<string, unknown>;
};

export type CoffeeProfileInsert = CoffeeProfileCore & {
  variety_ru: string | null;
  processing_ru: string | null;
  roast_level_ru: string | null;
  flavor_notes_ru: string[];
  texture_tags_ru: string[];
  mood_tags_ru: string[];
  description_ru: string | null;
};
