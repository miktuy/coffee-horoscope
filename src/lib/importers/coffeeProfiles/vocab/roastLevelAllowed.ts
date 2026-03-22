/**
 * Allowed roast_level_ru values.
 */
export const ROAST_LEVEL_RU_ALLOWED = [
  "светлая обжарка",
  "средняя обжарка",
  "средне-тёмная обжарка",
  "тёмная обжарка",
  "эспрессо-обжарка",
] as const;

export type RoastLevelRu = (typeof ROAST_LEVEL_RU_ALLOWED)[number];

const ALLOWED = new Set<string>(ROAST_LEVEL_RU_ALLOWED);

export function mapRoastEnToRu(raw: string | null | undefined): RoastLevelRu | null {
  if (!raw?.trim()) return null;
  const s = raw.toLowerCase();
  if (/\b(espresso|dark\s+espresso)\b/.test(s)) return "эспрессо-обжарка";
  if (/\b(very\s+)?dark\b/.test(s) || /\bdark\s+roast\b/.test(s)) return "тёмная обжарка";
  if (/\bmedium[\s-]dark\b/.test(s)) return "средне-тёмная обжарка";
  if (/\bmedium\b/.test(s)) return "средняя обжарка";
  if (/\b(light|blonde)\b/.test(s)) return "светлая обжарка";
  return null;
}

export function normalizeRoastLevelRu(value: string | null | undefined): RoastLevelRu | null {
  if (!value?.trim()) return null;
  const t = value.trim().toLowerCase();
  return ALLOWED.has(t) ? (t as RoastLevelRu) : null;
}
