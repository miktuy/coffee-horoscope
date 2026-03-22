import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadRussianMigrations(): string {
  const base = path.resolve(__dirname, "../../supabase/migrations");
  const a = readFileSync(
    path.join(base, "20260322204500_coffee_profiles_russian_columns.sql"),
    "utf8",
  );
  const b = readFileSync(
    path.join(base, "20260322220000_coffee_profiles_ru_fields_expand.sql"),
    "utf8",
  );
  return `${a}\n${b}`;
}

describe("coffee_profiles Russian columns migration", () => {
  const sql = loadRussianMigrations();

  it("adds Russian text and jsonb columns", () => {
    expect(sql).toMatch(/description_ru/i);
    expect(sql).toMatch(/flavor_notes_ru/i);
    expect(sql).toMatch(/mood_tags_ru/i);
    expect(sql).toMatch(/variety_ru/i);
    expect(sql).toMatch(/processing_ru/i);
    expect(sql).toMatch(/texture_tags_ru/i);
    expect(sql).toMatch(/roast_level_ru/i);
  });
});
