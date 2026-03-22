/** English country / region substrings → Russian nominative (for parentheses, lists). */

export const COUNTRY_NAME_RU: Record<string, string> = {
  colombia: "Колумбия",
  ethiopia: "Эфиопия",
  kenya: "Кения",
  brazil: "Бразилия",
  guatemala: "Гватемала",
  honduras: "Гондурас",
  "costa rica": "Коста-Рика",
  panama: "Панама",
  peru: "Перу",
  rwanda: "Руанда",
  burundi: "Бурунди",
  indonesia: "Индонезия",
  sumatra: "Суматра",
  java: "Ява",
  yemen: "Йемен",
  mexico: "Мексика",
  nicaragua: "Никарагуа",
  "el salvador": "Сальвадор",
  uganda: "Уганда",
  tanzania: "Танзания",
  china: "Китай",
  india: "Индия",
  vietnam: "Вьетнам",
  "united states": "США",
  usa: "США",
  taiwan: "Тайвань",
  laos: "Лаос",
};

/**
 * Genitive case after «из» (из Колумбии, из Коста-Рики, …).
 * Keys align with COUNTRY_NAME_RU.
 */
export const COUNTRY_GENITIVE_RU: Record<string, string> = {
  colombia: "Колумбии",
  ethiopia: "Эфиопии",
  kenya: "Кении",
  brazil: "Бразилии",
  guatemala: "Гватемалы",
  honduras: "Гондураса",
  "costa rica": "Коста-Рики",
  panama: "Панамы",
  peru: "Перу",
  rwanda: "Руанды",
  burundi: "Бурунди",
  indonesia: "Индонезии",
  sumatra: "Суматры",
  java: "Явы",
  yemen: "Йемена",
  mexico: "Мексики",
  nicaragua: "Никарагуа",
  "el salvador": "Сальвадора",
  uganda: "Уганды",
  tanzania: "Танзании",
  china: "Китая",
  india: "Индии",
  vietnam: "Вьетнама",
  "united states": "США",
  usa: "США",
  taiwan: "Тайваня",
  laos: "Лаоса",
};

export function countryOrPhraseToRu(phrase: string | undefined | null): string | null {
  if (!phrase) return null;
  const lower = phrase.toLowerCase();
  for (const [en, ru] of Object.entries(COUNTRY_NAME_RU)) {
    if (lower.includes(en)) return ru;
  }
  return null;
}

/** Same lookup, genitive form for «из …». */
export function countryOrPhraseToRuGenitive(phrase: string | undefined | null): string | null {
  if (!phrase) return null;
  const lower = phrase.toLowerCase();
  for (const [en, gen] of Object.entries(COUNTRY_GENITIVE_RU)) {
    if (lower.includes(en)) return gen;
  }
  return null;
}
