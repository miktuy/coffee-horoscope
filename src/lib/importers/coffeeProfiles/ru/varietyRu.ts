/**
 * English cultivar labels → short Russian labels (controlled, display-friendly).
 */
const VARIETY_EN_TO_RU: Array<{ pattern: RegExp; ru: string }> = [
  { pattern: /\b(gesha|geisha)\b/i, ru: "геша" },
  { pattern: /\bred\s+bourbon\b/i, ru: "красный бурбон" },
  { pattern: /\bcastillo\b/i, ru: "кастильо" },
  { pattern: /\bjava\b/i, ru: "ява" },
  { pattern: /\bheirloom\b/i, ru: "местные сорта" },
  { pattern: /\bour\s+heirloom\b/i, ru: "местные сорта" },
  { pattern: /\bSL\s*28\b/i, ru: "SL28" },
  { pattern: /\bSL\s*34\b/i, ru: "SL34" },
  { pattern: /\bSL\s*14\b/i, ru: "SL14" },
  { pattern: /\bbourbon\b/i, ru: "бурбон" },
  { pattern: /\btypica\b/i, ru: "типика" },
  { pattern: /\bcatuai\b/i, ru: "катуаи" },
  { pattern: /\bcaturra\b/i, ru: "катурра" },
  { pattern: /\bpacamara\b/i, ru: "пакамара" },
  { pattern: /\bmaragogype\b/i, ru: "марагоджип" },
  { pattern: /\bpink\s+bourbon\b/i, ru: "розовый бурбон" },
  { pattern: /\byellow\s+bourbon\b/i, ru: "жёлтый бурбон" },
  { pattern: /\bmundo\s+novo\b/i, ru: "мундо ново" },
  { pattern: /\barabica\b/i, ru: "арабика" },
  { pattern: /\brobusta\b/i, ru: "робуста" },
];

export function mapVarietyEnToRu(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  for (const { pattern, ru } of VARIETY_EN_TO_RU) {
    if (pattern.test(s)) return ru;
  }
  return s.length <= 48 ? s : `${s.slice(0, 47)}…`;
}
