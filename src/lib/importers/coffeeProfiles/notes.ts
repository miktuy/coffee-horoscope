/**
 * Heuristic: split tasting prose into short note chips for `flavor_notes` JSON array.
 */
export function extractFlavorNotesFromProse(text: string | undefined, maxItems = 12): string[] {
  if (!text) return [];
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/[;,]|\s+-\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 3 && p.length <= 120);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Chips that are variety / process / meta, not sensory flavor (English). */
const NON_SENSORY_CHIP = [
  /\b(washed|natural|honey|anaerobic|semi[\s-]?washed|pulped\s+natural)\b/i,
  /\b(heirloom|bourbon|typica|gesha|geisha|catuai|caturra|pacamara|maragogype|mundo\s+novo|SL\s*\d+)\b/i,
  /\b(processing|ferment|dry\s+process|wet\s+process)\b/i,
  /\b(aroma|flavor|acidity|body)\s+\d/i,
];

export function isNonSensoryFlavorChip(chip: string): boolean {
  const s = chip.trim();
  if (s.length < 3) return true;
  return NON_SENSORY_CHIP.some((re) => re.test(s));
}

/**
 * English flavor note chips for `flavor_notes` — sensory only (no variety / processing).
 */
export function extractSensoryFlavorNotesEn(
  blind: string | undefined,
  notes: string | undefined,
  maxItems = 24,
): string[] {
  const raw = [
    ...extractFlavorNotesFromProse(blind, maxItems),
    ...extractFlavorNotesFromProse(notes, maxItems),
  ];
  const filtered = raw.filter((c) => !isNonSensoryFlavorChip(c));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of filtered) {
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= maxItems) break;
  }
  return out;
}
