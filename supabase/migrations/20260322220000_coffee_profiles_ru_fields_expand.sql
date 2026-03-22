-- Expand Russian-facing fields: variety, processing, roast, texture (separate from sensory flavor notes)

ALTER TABLE public.coffee_profiles
  ADD COLUMN IF NOT EXISTS variety_ru text,
  ADD COLUMN IF NOT EXISTS processing_ru text,
  ADD COLUMN IF NOT EXISTS texture_tags_ru jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS roast_level_ru text;

ALTER TABLE public.coffee_profiles
  ADD CONSTRAINT coffee_profiles_texture_tags_ru_is_array
    CHECK (jsonb_typeof(texture_tags_ru) = 'array');

COMMENT ON COLUMN public.coffee_profiles.variety_ru IS 'Cultivar / variety label in Russian (controlled mapping).';
COMMENT ON COLUMN public.coffee_profiles.processing_ru IS 'Processing method in Russian (controlled vocabulary).';
COMMENT ON COLUMN public.coffee_profiles.texture_tags_ru IS 'Mouthfeel / body texture tags in Russian (controlled vocabulary).';
COMMENT ON COLUMN public.coffee_profiles.roast_level_ru IS 'Roast style in Russian (controlled vocabulary).';
