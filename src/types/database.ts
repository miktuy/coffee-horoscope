/**
 * Row shapes for the Coffee Horoscope PostgreSQL schema (Supabase-compatible).
 * Column names use snake_case to match SQL.
 */

/** Reference row for one of the twelve zodiac signs (seeded once, rarely edited). */
export type ZodiacSignRow = {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  /** Human-readable season window, e.g. Russian date span copy. */
  date_range_label: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/**
 * Reusable coffee drink / roast profile: tasting notes and arbitrary metadata
 * (origin, process, intensity, etc.) stored as JSON for flexibility.
 */
export type CoffeeProfileRow = {
  id: string;
  slug: string | null;
  display_name: string;
  description: string | null;
  /** JSON array of strings, e.g. ["caramel", "citrus"]. */
  flavor_notes: unknown;
  variety_ru: string | null;
  processing_ru: string | null;
  roast_level_ru: string | null;
  /** Russian sensory flavor chips (controlled vocabulary). */
  flavor_notes_ru: unknown;
  /** Russian mouthfeel tags (controlled vocabulary). */
  texture_tags_ru: unknown;
  /** Russian mood tags for horoscope copy (controlled vocabulary). */
  mood_tags_ru: unknown;
  /** JSON object with extra structured fields. */
  metadata: unknown;
  /** Short natural-language Russian profile (templates, not literal EN translation). */
  description_ru: string | null;
  created_at: string;
  updated_at: string;
};

export const GENERATION_RUN_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
] as const;

export type GenerationRunStatus = (typeof GENERATION_RUN_STATUSES)[number];

/**
 * One batch job that generates horoscopes for every sign across an inclusive
 * calendar date range [date_from, date_to].
 */
export type GenerationsRunRow = {
  id: string;
  date_from: string;
  date_to: string;
  status: GenerationRunStatus;
  error_message: string | null;
  /** JSON object: counts, model id, prompt version, etc. */
  meta: unknown;
  created_at: string;
  updated_at: string;
};

/**
 * Daily horoscope copy for a single sign. Uniqueness: one row per
 * (zodiac_sign_id, horoscope_date) — enforced in the database.
 */
export type DailyHoroscopeRow = {
  id: string;
  zodiac_sign_id: string;
  /** ISO calendar date (YYYY-MM-DD), stored as Postgres `date`. */
  horoscope_date: string;
  reading: string;
  coffee_pick: string;
  coffee_profile_id: string | null;
  generation_run_id: string | null;
  created_at: string;
  updated_at: string;
};
