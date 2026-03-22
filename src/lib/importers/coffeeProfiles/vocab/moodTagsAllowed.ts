/**
 * Allowed mood tags for horoscope-style copy. Only these may appear in mood_tags_ru.
 */
export const MOOD_TAGS_RU_ALLOWED = [
  "уютный",
  "яркий",
  "бодрый",
  "мягкий",
  "насыщенный",
  "утончённый",
  "игривый",
  "глубокий",
  "спокойный",
] as const;

export type MoodTagRu = (typeof MOOD_TAGS_RU_ALLOWED)[number];

const ALLOWED = new Set<string>(MOOD_TAGS_RU_ALLOWED);

type Theme = "bright" | "calm" | "deep" | "refined";

/** Ordered presets per theme — 2–3 compatible tags. */
const THEME_PRESETS: Record<Theme, MoodTagRu[]> = {
  bright: ["яркий", "бодрый", "игривый"],
  calm: ["спокойный", "мягкий", "уютный"],
  deep: ["глубокий", "насыщенный", "уютный"],
  refined: ["утончённый", "насыщенный", "мягкий"],
};

export function isAllowedMoodTag(tag: string): tag is MoodTagRu {
  return ALLOWED.has(tag);
}

export function takeAllowedMoodTags(tags: string[], max = 3): MoodTagRu[] {
  const out: MoodTagRu[] = [];
  for (const t of tags) {
    if (ALLOWED.has(t) && !out.includes(t as MoodTagRu)) {
      out.push(t as MoodTagRu);
    }
    if (out.length >= max) break;
  }
  return out;
}

type ScoreCtx = {
  acidity: number | null;
  body: number | null;
  flavor: number | null;
  rating: number | null;
  total_cup_points: number | null;
};

function pickTheme(scores: ScoreCtx, roastEn: string): Theme {
  const ac = scores.acidity;
  const bd = scores.body;
  const fl = scores.flavor;
  const cup = scores.total_cup_points;
  const r = roastEn.toLowerCase();

  let bright = 0;
  let calm = 0;
  let deep = 0;
  let refined = 0;

  if (ac !== null && ac >= 8.45) bright += 3;
  else if (ac !== null && ac >= 8.1) bright += 1.5;

  if (bd !== null && bd >= 8.5) deep += 2.5;
  if (fl !== null && fl >= 8.85) refined += 2.5;
  if (scores.rating !== null && scores.rating >= 94) refined += 1.5;
  if (cup !== null && cup >= 88) deep += 1;
  if (cup !== null && cup <= 83) calm += 2;

  if (ac !== null && ac <= 7.65 && bd !== null && bd >= 8) {
    deep += 2;
    calm += 0.5;
  }

  if (r.includes("light")) bright += 2.5;
  if (r.includes("dark")) {
    deep += 2;
    calm += 1;
  }
  if (r.includes("medium")) calm += 1.5;

  if (bright === 0 && calm === 0 && deep === 0 && refined === 0) calm += 1;

  let best: Theme = "calm";
  let bestV = calm;
  const table: Array<[Theme, number]> = [
    ["bright", bright],
    ["calm", calm],
    ["deep", deep],
    ["refined", refined],
  ];
  for (const [t, v] of table) {
    if (v > bestV) {
      bestV = v;
      best = t;
    }
  }
  return best;
}

/** Raw signals from scores (may mix themes — we filter through THEME_PRESETS). */
function signalTags(scores: ScoreCtx, roastEn: string): MoodTagRu[] {
  const ac = scores.acidity;
  const bd = scores.body;
  const fl = scores.flavor;
  const rating = scores.rating;
  const cup = scores.total_cup_points;
  const r = roastEn.toLowerCase();

  const out: MoodTagRu[] = [];

  if (ac !== null && ac >= 8.5) out.push("бодрый", "яркий");
  if (ac !== null && ac <= 7.55 && bd !== null && bd >= 8) out.push("мягкий", "глубокий");
  if (bd !== null && bd >= 8.5) out.push("насыщенный");
  if (fl !== null && fl >= 8.8) out.push("утончённый");
  if (rating !== null && rating >= 94) out.push("утончённый", "насыщенный");
  if (cup !== null && cup >= 88) out.push("насыщенный");
  if (cup !== null && cup <= 83) out.push("спокойный");

  if (r.includes("light")) out.push("игривый", "яркий");
  if (r.includes("dark")) out.push("глубокий", "уютный");
  if (r.includes("medium")) out.push("мягкий");

  if (out.length === 0) out.push("спокойный", "мягкий");

  return [...new Set(out.filter((t) => ALLOWED.has(t)))];
}

/** 2–3 tags from one theme, intersecting data signals when possible. */
export function inferMoodTagsRu(ctx: {
  scores: ScoreCtx;
  roastEn?: string | null;
  seed?: string;
}): MoodTagRu[] {
  const roastEn = ctx.roastEn ?? "";
  const theme = pickTheme(ctx.scores, roastEn);
  const preset = THEME_PRESETS[theme];
  const signals = signalTags(ctx.scores, roastEn);

  const fromSignals = preset.filter((t) => signals.includes(t));
  const h = hashSeed(ctx.seed ?? "");

  let picked: MoodTagRu[] = [...fromSignals];

  for (const t of preset) {
    if (picked.length >= 2) break;
    if (!picked.includes(t)) picked.push(t);
  }

  while (picked.length < 2) {
    const t = preset[(picked.length + h) % preset.length];
    if (!picked.includes(t)) picked.push(t);
    else break;
  }

  picked = takeAllowedMoodTags(picked, 3);

  if (picked.length < 2) {
    picked = takeAllowedMoodTags([preset[h % preset.length], preset[(h + 1) % preset.length]], 2);
  }

  return picked;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
