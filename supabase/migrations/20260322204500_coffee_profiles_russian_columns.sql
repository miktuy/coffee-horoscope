-- Russian-facing copy for coffee_profiles (dictionary-driven in app, not raw MT)

ALTER TABLE public.coffee_profiles
  ADD COLUMN IF NOT EXISTS description_ru text,
  ADD COLUMN IF NOT EXISTS flavor_notes_ru jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mood_tags_ru jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.coffee_profiles
  ADD CONSTRAINT coffee_profiles_flavor_notes_ru_is_array
    CHECK (jsonb_typeof(flavor_notes_ru) = 'array'),
  ADD CONSTRAINT coffee_profiles_mood_tags_ru_is_array
    CHECK (jsonb_typeof(mood_tags_ru) = 'array');

COMMENT ON COLUMN public.coffee_profiles.description_ru IS 'Short Russian description generated from normalized fields (templates), not literal EN translation.';
COMMENT ON COLUMN public.coffee_profiles.flavor_notes_ru IS 'Russian flavor chips mapped from dictionaries / token rules.';
COMMENT ON COLUMN public.coffee_profiles.mood_tags_ru IS 'Russian mood tags inferred from scores, roast, and note keywords.';
