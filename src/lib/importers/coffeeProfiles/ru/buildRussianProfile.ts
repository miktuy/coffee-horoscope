import type { CoffeeProfileCore, CoffeeProfileInsert } from "../types";
import {
  inferFlavorNotesRuFromCqiScores,
  mapEnglishChipsToFlavorNotesRu,
  mapEnglishSensoryTextToFlavorNotesRu,
  takeFlavorNotesRu,
  type FlavorNoteRu,
} from "../vocab/flavorNotesAllowed";
import { inferMoodTagsRu } from "../vocab/moodTagsAllowed";
import { mapProcessingEnToRu } from "../vocab/processingAllowed";
import { mapRoastEnToRu } from "../vocab/roastLevelAllowed";
import { inferTextureTagsRu } from "../vocab/textureTagsAllowed";
import { countryOrPhraseToRuGenitive } from "./countryMap";
import { mapVarietyEnToRu } from "./varietyRu";

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  return v.trim();
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** When origin is unknown — alternate natural openers (no vague «интересным происхождением»). */
function openingFallbackLine(seed: string): string {
  return hashSeed(seed) % 2 === 0
    ? "Кофе с выразительным профилем."
    : "Кофе с классическим характером.";
}

function joinNatural(parts: Array<string | null | undefined>): string {
  return parts.filter((p): p is string => Boolean(p)).join(" ");
}

function flavorClauseRu(notes: FlavorNoteRu[]): string {
  if (notes.length === 0) return "сбалансированные ноты";
  if (notes.length === 1) return notes[0];
  if (notes.length === 2) return `${notes[0]} и ${notes[1]}`;
  return `${notes.slice(0, -1).join(", ")} и ${notes[notes.length - 1]}`;
}

function textureClauseRu(tags: string[]): string {
  if (tags.length === 0) return "ровная, приятная";
  if (tags.length === 1) return tags[0];
  return `${tags[0]} и ${tags[1]}`;
}

function roastSentence(roast_level_ru: string | null): string | null {
  if (!roast_level_ru?.trim()) return null;
  const s = roast_level_ru.trim();
  const cap = s.charAt(0).toUpperCase() + s.slice(1);
  return cap.endsWith(".") ? cap : `${cap}.`;
}

function moodClauseRu(tags: string[]): string | null {
  const t = tags.slice(0, 2);
  if (t.length === 0) return null;
  if (t.length === 1) return t[0];
  return `${t[0]} и ${t[1]}`;
}

function describeCoffeeReviewRu(ctx: {
  originGenitive: string | null;
  roast_level_ru: string | null;
  flavor_notes_ru: FlavorNoteRu[];
  texture_tags_ru: string[];
  mood_tags_ru: string[];
  rating: number | null;
  seed: string;
}): string | null {
  const { originGenitive, roast_level_ru, flavor_notes_ru, texture_tags_ru, mood_tags_ru, rating, seed } =
    ctx;

  const opening = originGenitive ? `Кофе из ${originGenitive}.` : openingFallbackLine(seed);

  const roast = roastSentence(roast_level_ru);
  const flavors = flavorClauseRu(flavor_notes_ru);
  const tex = textureClauseRu(texture_tags_ru);
  const mood = moodClauseRu(mood_tags_ru);

  const ratingBit =
    rating !== null && rating >= 92
      ? " Выразительный и запоминающийся в чашке."
      : rating !== null && rating >= 88
        ? " Приятный повседневный выбор."
        : "";

  const tasteBlock = joinNatural([
    roast,
    `Во вкусе — ${flavors}. Текстура: ${tex}.`,
  ]);

  const moodBit = mood ? ` Характер чашки — ${mood}.` : "";

  return (opening + " " + tasteBlock + moodBit + ratingBit).replace(/\s+/g, " ").trim();
}

function describeCqiRu(ctx: {
  countryGenitive: string | null;
  region: string | null;
  variety_ru: string | null;
  processing_ru: string | null;
  flavor_notes_ru: FlavorNoteRu[];
  texture_tags_ru: string[];
  mood_tags_ru: string[];
  seed: string;
}): string | null {
  const { countryGenitive, region, variety_ru, processing_ru, flavor_notes_ru, texture_tags_ru, mood_tags_ru, seed } =
    ctx;

  const flavors = flavorClauseRu(flavor_notes_ru);
  const tex = textureClauseRu(texture_tags_ru);
  const mood = moodClauseRu(mood_tags_ru);

  let head: string;
  if (countryGenitive) {
    const reg = region ? ` Регион: ${region}.` : "";
    head = `Зерно из ${countryGenitive}.${reg}`;
  } else {
    head = openingFallbackLine(seed);
  }

  const proc = processing_ru ? ` Обработка — ${processing_ru}.` : "";
  const varl = variety_ru ? ` Сорт — ${variety_ru}.` : "";

  const moodBit = mood ? ` Характер — ${mood}.` : "";

  return joinNatural([
    (head + proc + varl).trim(),
    `Вкус: ${flavors}. Текстура — ${tex}.${moodBit}`,
  ]);
}

/** Attach vocabulary-backed Russian fields to a core profile row. */
export function buildRussianProfile(core: CoffeeProfileCore): CoffeeProfileInsert {
  const m = core.metadata;
  const source = String(m.source ?? "");
  const seed = core.slug;

  const varietyRaw = str(m.variety);
  const variety_ru = mapVarietyEnToRu(varietyRaw);

  const processingRaw = str(m.processing_method);
  const processing_ru = mapProcessingEnToRu(processingRaw);

  const roastRaw = str(m.roast_level);
  const roast_level_ru = mapRoastEnToRu(roastRaw);

  const scores = {
    acidity: num(m.acidity),
    body: num(m.body),
    flavor: num(m.flavor),
    aroma: num(m.aroma),
    aftertaste: num(m.aftertaste),
    sweetness: num(m.sweetness),
    rating: num(m.rating),
    total_cup_points: num(m.total_cup_points),
  };

  const blindEn = str(m.blind_assessment);
  const notesEn = str(m.notes_text);

  let flavor_notes_ru: FlavorNoteRu[] = [];

  if (source === "cqi") {
    flavor_notes_ru = inferFlavorNotesRuFromCqiScores(
      {
        aroma: scores.aroma,
        flavor: scores.flavor,
        acidity: scores.acidity,
        body: scores.body,
        sweetness: scores.sweetness,
      },
      seed,
    );
  } else {
    const fromChips = mapEnglishChipsToFlavorNotesRu(core.flavor_notes);
    const fromProse = mapEnglishSensoryTextToFlavorNotesRu(
      [blindEn, notesEn].filter(Boolean).join(" "),
    );
    flavor_notes_ru = takeFlavorNotesRu([...fromChips, ...fromProse], 6);
  }

  const texture_tags_ru = inferTextureTagsRu({
    scores: { body: scores.body, acidity: scores.acidity },
    blindEn: source === "coffee_review" ? blindEn : null,
    seed,
  });

  const mood_tags_ru = inferMoodTagsRu({
    scores: {
      acidity: scores.acidity,
      body: scores.body,
      flavor: scores.flavor,
      rating: scores.rating,
      total_cup_points: scores.total_cup_points,
    },
    roastEn: roastRaw,
    seed,
  });

  const originGenitive =
    countryOrPhraseToRuGenitive(str(m.coffee_origin)) ??
    countryOrPhraseToRuGenitive(str(m.country_of_origin));

  let description_ru: string | null = null;

  if (source === "coffee_review") {
    description_ru = describeCoffeeReviewRu({
      originGenitive,
      roast_level_ru,
      flavor_notes_ru,
      texture_tags_ru,
      mood_tags_ru,
      rating: scores.rating,
      seed,
    });
  } else if (source === "cqi") {
    description_ru = describeCqiRu({
      countryGenitive: countryOrPhraseToRuGenitive(str(m.country_of_origin)),
      region: str(m.region),
      variety_ru: variety_ru ?? null,
      processing_ru: processing_ru ?? null,
      flavor_notes_ru,
      texture_tags_ru,
      mood_tags_ru,
      seed,
    });
  }

  return {
    ...core,
    variety_ru: variety_ru ?? null,
    processing_ru: processing_ru ?? null,
    roast_level_ru: roast_level_ru ?? null,
    flavor_notes_ru,
    texture_tags_ru,
    mood_tags_ru,
    description_ru,
  };
}

/** @deprecated Use buildRussianProfile */
export function applyRussianProfile(core: CoffeeProfileCore): CoffeeProfileInsert {
  return buildRussianProfile(core);
}
