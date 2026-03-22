/**
 * Allowed texture_tags_ru (mouthfeel / body). Short phrases, consistent grammar.
 */
export const TEXTURE_TAGS_RU_ALLOWED = [
  "лёгкое тело",
  "среднее тело",
  "плотное тело",
  "шёлковистое",
  "маслянистое",
  "чистое",
  "округлое",
  "чайное ощущение",
  "сочное",
  "бархатистое",
  "кремовое",
  "плотная текстура",
  "воздушное тело",
  "прямолинейное тело",
  "густое",
] as const;

export type TextureTagRu = (typeof TEXTURE_TAGS_RU_ALLOWED)[number];

const ALLOWED = new Set<string>(TEXTURE_TAGS_RU_ALLOWED);

export function takeAllowedTextureTags(tags: string[], max = 2): TextureTagRu[] {
  const out: TextureTagRu[] = [];
  for (const t of tags) {
    if (ALLOWED.has(t) && !out.includes(t as TextureTagRu)) {
      out.push(t as TextureTagRu);
    }
    if (out.length >= max) break;
  }
  return out;
}

type ScoreCtx = {
  body: number | null;
  acidity: number | null;
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const LIGHT: TextureTagRu[] = [
  "лёгкое тело",
  "воздушное тело",
  "чистое",
  "прямолинейное тело",
];
const MID: TextureTagRu[] = [
  "среднее тело",
  "округлое",
  "бархатистое",
  "шёлковистое",
  "чистое",
];
const HEAVY: TextureTagRu[] = [
  "плотное тело",
  "сочное",
  "густое",
  "маслянистое",
  "кремовое",
  "плотная текстура",
];

function blindHints(blind: string): TextureTagRu[] {
  const b = blind.toLowerCase();
  const out: TextureTagRu[] = [];
  if (/\b(silky|smooth)\b/.test(b)) out.push("шёлковистое");
  if (/\b(oily|creamy|buttery)\b/.test(b)) out.push("кремовое");
  if (/\btea[\s-]?like\b/.test(b)) out.push("чайное ощущение");
  if (/\bjuicy\b/.test(b)) out.push("сочное");
  if (/\bvelvet|velvety\b/.test(b)) out.push("бархатистое");
  return out.filter((t) => ALLOWED.has(t));
}

/** Two tags: anchor by body tier + hint or rotated companion (avoids «среднее + округлое» everywhere). */
export function inferTextureTagsRu(ctx: {
  scores: ScoreCtx;
  blindEn?: string | null;
  seed?: string;
}): TextureTagRu[] {
  const { scores, blindEn } = ctx;
  const seed = hashSeed(ctx.seed ?? "tex");
  const bd = scores.body;

  let pool: TextureTagRu[];
  if (bd === null) {
    pool = MID;
  } else if (bd >= 8.35) {
    pool = HEAVY;
  } else if (bd >= 7.45) {
    pool = MID;
  } else {
    pool = LIGHT;
  }

  const anchor = pool[seed % pool.length] as TextureTagRu;

  const hints = blindEn ? blindHints(blindEn) : [];
  let companion =
    hints.find((h) => h !== anchor && pool.includes(h)) ??
    hints.find((h) => h !== anchor) ??
    null;

  if (companion === null) {
    const alt = pool.filter((t) => t !== anchor);
    const midAlt = MID.filter((t) => t !== anchor);
    const pick =
      alt.length > 0
        ? alt[(seed + 1) % alt.length]
        : midAlt[(seed + 1) % midAlt.length] ?? MID[seed % MID.length];
    companion = pick as TextureTagRu;
  }

  if (companion === anchor) {
    const fallback = MID.filter((t) => t !== anchor);
    companion = fallback[(seed + 2) % fallback.length] as TextureTagRu;
  }

  return takeAllowedTextureTags([anchor, companion], 2);
}
