-- Coffee Horoscope core schema (PostgreSQL / Supabase compatible)
-- Requires: gen_random_uuid() (available on Supabase; otherwise: CREATE EXTENSION IF NOT EXISTS pgcrypto;)

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- zodiac_signs — canonical twelve signs (reference data seeded by app/migration)
-- ---------------------------------------------------------------------------
CREATE TABLE public.zodiac_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  symbol text NOT NULL,
  date_range_label text,
  sort_order smallint NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zodiac_signs_sort_order_range CHECK (sort_order >= 1 AND sort_order <= 12)
);

CREATE TRIGGER zodiac_signs_set_updated_at
BEFORE UPDATE ON public.zodiac_signs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.zodiac_signs IS 'Twelve zodiac signs; slug matches app ids (e.g. aries). sort_order is display order.';

-- ---------------------------------------------------------------------------
-- coffee_profiles — flavor notes + structured metadata for drinks/profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.coffee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  display_name text NOT NULL,
  description text,
  flavor_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coffee_profiles_flavor_notes_is_array CHECK (jsonb_typeof(flavor_notes) = 'array'),
  CONSTRAINT coffee_profiles_metadata_is_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TRIGGER coffee_profiles_set_updated_at
BEFORE UPDATE ON public.coffee_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_coffee_profiles_slug ON public.coffee_profiles (slug);

COMMENT ON TABLE public.coffee_profiles IS 'Reusable coffee descriptors: tasting notes (flavor_notes JSON array) and extra fields (metadata JSON object).';

-- ---------------------------------------------------------------------------
-- generations_runs — batch LLM/cron jobs over inclusive date ranges
-- ---------------------------------------------------------------------------
CREATE TABLE public.generations_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_from date NOT NULL,
  date_to date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generations_runs_status_check CHECK (
    status IN ('pending', 'running', 'completed', 'failed')
  ),
  CONSTRAINT generations_runs_date_order CHECK (date_from <= date_to),
  CONSTRAINT generations_runs_meta_is_object CHECK (jsonb_typeof(meta) = 'object')
);

CREATE TRIGGER generations_runs_set_updated_at
BEFORE UPDATE ON public.generations_runs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_generations_runs_dates ON public.generations_runs (date_from, date_to);
CREATE INDEX idx_generations_runs_status ON public.generations_runs (status);

COMMENT ON TABLE public.generations_runs IS 'Tracks batch generation for inclusive [date_from, date_to]; links many daily_horoscopes rows.';

-- ---------------------------------------------------------------------------
-- daily_horoscopes — one reading per sign per calendar date
-- ---------------------------------------------------------------------------
CREATE TABLE public.daily_horoscopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zodiac_sign_id uuid NOT NULL REFERENCES public.zodiac_signs (id) ON DELETE CASCADE,
  horoscope_date date NOT NULL,
  reading text NOT NULL,
  coffee_pick text NOT NULL,
  coffee_profile_id uuid REFERENCES public.coffee_profiles (id) ON DELETE SET NULL,
  generation_run_id uuid REFERENCES public.generations_runs (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_horoscopes_one_per_sign_per_date UNIQUE (zodiac_sign_id, horoscope_date)
);

CREATE TRIGGER daily_horoscopes_set_updated_at
BEFORE UPDATE ON public.daily_horoscopes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_daily_horoscopes_date ON public.daily_horoscopes (horoscope_date);
CREATE INDEX idx_daily_horoscopes_sign ON public.daily_horoscopes (zodiac_sign_id);
CREATE INDEX idx_daily_horoscopes_generation_run ON public.daily_horoscopes (generation_run_id);

COMMENT ON TABLE public.daily_horoscopes IS 'Daily copy per sign; horoscope_date is calendar day in generation timezone (UTC date recommended for storage).';
