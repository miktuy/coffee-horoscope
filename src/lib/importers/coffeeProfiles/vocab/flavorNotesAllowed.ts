/**
 * Normalized Russian flavor note chips (sensory only). Only these may appear in flavor_notes_ru.
 */
export const FLAVOR_NOTES_RU_ALLOWED = [
  "цитрус",
  "ягоды",
  "цветы",
  "какао",
  "молочный шоколад",
  "карамель",
  "мёд",
  "орехи",
  "специи",
  "тропические фрукты",
  "косточковые фрукты",
  "чёрный чай",
  "винные ноты",
  "земляные ноты",
  "травяные ноты",
  "ваниль",
  "яблоко",
  "груша",
  "сухофрукты",
  "цитрусовая цедра",
  "жжёный сахар",
  "табак",
  "дымные ноты",
  "ирис",
  "личи",
  "вишня",
] as const;

export type FlavorNoteRu = (typeof FLAVOR_NOTES_RU_ALLOWED)[number];

const ALLOWED = new Set<string>(FLAVOR_NOTES_RU_ALLOWED);

/** Longest-match English sensory patterns → single controlled Russian chip. Order matters (specific first). */
const EN_TO_RU_RULES: Array<{ pattern: RegExp; ru: FlavorNoteRu }> = [
  { pattern: /\b(lemon|lime|grapefruit|orange\s+peel|orange\b|citrus|citric)\b/i, ru: "цитрус" },
  { pattern: /\b(citrus\s+zest|zesty)\b/i, ru: "цитрусовая цедра" },
  { pattern: /\b(blackberry|blueberry|strawberry|raspberry|berry|berries)\b/i, ru: "ягоды" },
  { pattern: /\b(jasmine|rose|lavender|floral|flowers?)\b/i, ru: "цветы" },
  { pattern: /\b(milk\s+chocolate)\b/i, ru: "молочный шоколад" },
  { pattern: /\b(cocoa|dark\s+chocolate|chocolate)\b/i, ru: "какао" },
  { pattern: /\b(caramel|toffee|butterscotch)\b/i, ru: "карамель" },
  { pattern: /\b(honey|honeyed)\b/i, ru: "мёд" },
  { pattern: /\b(almond|hazelnut|pecan|walnut|nutty|nuts?)\b/i, ru: "орехи" },
  { pattern: /\b(cinnamon|clove|pepper|spice|spicy|baking\s+spice)\b/i, ru: "специи" },
  { pattern: /\b(mango|pineapple|passion\s+fruit|tropical)\b/i, ru: "тропические фрукты" },
  { pattern: /\b(peach|apricot|plum|nectarine|stone\s+fruit)\b/i, ru: "косточковые фрукты" },
  { pattern: /\b(black\s+tea|oolong|tea[\s-]?like|tea\b)\b/i, ru: "чёрный чай" },
  { pattern: /\b(wine|winey|vinous|grape)\b/i, ru: "винные ноты" },
  { pattern: /\b(earthy|earth|soil|forest\s+floor)\b/i, ru: "земляные ноты" },
  { pattern: /\b(herbal|herb|mint|sage)\b/i, ru: "травяные ноты" },
  { pattern: /\bvanilla\b/i, ru: "ваниль" },
  { pattern: /\bapple\b/i, ru: "яблоко" },
  { pattern: /\bpear\b/i, ru: "груша" },
  { pattern: /\b(raisin|prune|date|fig|dried\s+fruit)\b/i, ru: "сухофрукты" },
  { pattern: /\b(brown\s+sugar|molasses|panela)\b/i, ru: "жжёный сахар" },
  { pattern: /\b(tobacco|pipe\s+tobacco)\b/i, ru: "табак" },
  { pattern: /\b(smoky|smoke|roasty)\b/i, ru: "дымные ноты" },
  { pattern: /\b(lychee|lychees)\b/i, ru: "личи" },
  { pattern: /\b(cherry|maraschino)\b/i, ru: "вишня" },
  { pattern: /\b(perfumed|perfume|iris)\b/i, ru: "ирис" },
];

export function mapEnglishSensoryTextToFlavorNotesRu(text: string | null | undefined): FlavorNoteRu[] {
  if (!text?.trim()) return [];
  const s = text.toLowerCase();
  const found: FlavorNoteRu[] = [];
  for (const { pattern, ru } of EN_TO_RU_RULES) {
    if (pattern.test(s)) found.push(ru);
  }
  return dedupeFlavorRu(found);
}

export function mapEnglishChipsToFlavorNotesRu(chips: string[]): FlavorNoteRu[] {
  const out: FlavorNoteRu[] = [];
  for (const c of chips) {
    out.push(...mapEnglishSensoryTextToFlavorNotesRu(c));
  }
  return dedupeFlavorRu(out);
}

export function takeFlavorNotesRu(tags: FlavorNoteRu[], max = 8): FlavorNoteRu[] {
  const seen = new Set<string>();
  const out: FlavorNoteRu[] = [];
  for (const t of tags) {
    if (!ALLOWED.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function dedupeFlavorRu(tags: FlavorNoteRu[]): FlavorNoteRu[] {
  const seen = new Set<string>();
  const out: FlavorNoteRu[] = [];
  for (const t of tags) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

type CqiScores = {
  aroma: number | null;
  flavor: number | null;
  acidity: number | null;
  body: number | null;
  sweetness: number | null;
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** When there is no tasting prose, infer chips from cupping scores (CQI); seed rotates order for variety. */
export function inferFlavorNotesRuFromCqiScores(scores: CqiScores, seed = ""): FlavorNoteRu[] {
  const { aroma, flavor, acidity, body, sweetness } = scores;
  const candidates: FlavorNoteRu[] = [];

  if (acidity !== null && acidity >= 8.25) candidates.push("цитрус", "ягоды", "вишня");
  if (body !== null && body >= 8.25 && (sweetness ?? 0) >= 8.5) candidates.push("карамель", "какао", "молочный шоколад");
  if (flavor !== null && flavor >= 8.25 && (aroma ?? 0) >= 8.2) candidates.push("цветы", "ягоды", "ирис");
  if (body !== null && body >= 8.4) candidates.push("молочный шоколад", "орехи", "какао");
  if (acidity !== null && acidity <= 7.75 && body !== null && body >= 8) candidates.push("какао", "сухофрукты", "специи");

  if (candidates.length === 0) {
    if ((flavor ?? 0) >= 8) candidates.push("какао", "карамель", "орехи");
    else candidates.push("орехи", "какао", "карамель");
  }

  const uniq = dedupeFlavorRu(candidates);
  const h = hashSeed(seed);
  const rot = uniq.length ? [...uniq.slice(h % uniq.length), ...uniq.slice(0, h % uniq.length)] : uniq;
  return takeFlavorNotesRu(rot, 5);
}
