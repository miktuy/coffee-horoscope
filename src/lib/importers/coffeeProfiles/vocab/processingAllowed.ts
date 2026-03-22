/**
 * Allowed processing_ru values (single label per profile).
 */
export const PROCESSING_RU_ALLOWED = [
  "мытая",
  "натуральная",
  "мёдная",
  "полумытая",
  "анаэробная",
  "экспериментальная",
  "смешанная",
] as const;

export type ProcessingRu = (typeof PROCESSING_RU_ALLOWED)[number];

const ALLOWED = new Set<string>(PROCESSING_RU_ALLOWED);

const EN_RULES: Array<{ pattern: RegExp; value: ProcessingRu }> = [
  { pattern: /\bdouble\s+anaerobic\b/i, value: "анаэробная" },
  { pattern: /\banaerobic\b/i, value: "анаэробная" },
  { pattern: /\bsemi[\s-]?washed\b/i, value: "полумытая" },
  { pattern: /\bpulped\s+natural\b/i, value: "мёдная" },
  { pattern: /\bhoney\b/i, value: "мёдная" },
  { pattern: /\bnatural\b/i, value: "натуральная" },
  { pattern: /\bwashed\b/i, value: "мытая" },
  { pattern: /\bdry\s+processed\b/i, value: "натуральная" },
  { pattern: /\bexperimental\b/i, value: "экспериментальная" },
  { pattern: /\bmixed\b/i, value: "смешанная" },
];

export function mapProcessingEnToRu(raw: string | null | undefined): ProcessingRu | null {
  if (!raw?.trim()) return null;
  const s = raw.toLowerCase();
  for (const { pattern, value } of EN_RULES) {
    if (pattern.test(s)) return value;
  }
  return null;
}

export function normalizeProcessingRu(value: string | null | undefined): ProcessingRu | null {
  if (!value?.trim()) return null;
  const t = value.trim().toLowerCase();
  return ALLOWED.has(t) ? (t as ProcessingRu) : null;
}
