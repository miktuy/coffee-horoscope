# Coffee Horoscope — database tables

PostgreSQL schema in `supabase/migrations/20260322193000_coffee_horoscope_schema.sql`. Types live in `src/types/database.ts`.

## `zodiac_signs`

Canonical list of the twelve signs. Use `slug` for stable keys (e.g. `aries`), `sort_order` for UI order (1–12), and `date_range_label` for display copy. Horoscopes reference this table by `id`.

## `coffee_profiles`

Reusable coffee descriptors: `display_name`, optional `slug`, `flavor_notes` (JSON **array** of strings, e.g. tasting notes), and `metadata` (JSON **object** for roast, process, origin, etc.). Linked optionally from `daily_horoscopes` when a day’s drink maps to a profile.

Russian-facing columns: `20260322204500_coffee_profiles_russian_columns.sql` adds **`description_ru`**, **`flavor_notes_ru`**, **`mood_tags_ru`**; `20260322220000_coffee_profiles_ru_fields_expand.sql` adds **`variety_ru`**, **`processing_ru`**, **`roast_level_ru`**, **`texture_tags_ru`**. The importer fills these from **controlled vocabularies** (mood, processing, roast, texture, flavor) plus short template copy — not raw machine translation of the English `description`.

## `daily_horoscopes`

One row per **zodiac sign per calendar `horoscope_date`**. Stores the short reading (`reading`) and drink line (`coffee_pick`). **`UNIQUE (zodiac_sign_id, horoscope_date)`** enforces a single horoscope per sign per day. `generation_run_id` ties rows to the batch job that created them; `coffee_profile_id` is optional.

## `generations_runs`

Represents a **batch generation** over an inclusive date range `[date_from, date_to]` (checked so `date_from <= date_to`). `status` tracks lifecycle (`pending` → `running` → `completed` or `failed`); `error_message` and `meta` (JSON object) hold diagnostics and batch stats. Many `daily_horoscopes` rows can reference one run.

All four tables have **`created_at`** and **`updated_at`** (`timestamptz`), with triggers calling `set_updated_at()` on update.
