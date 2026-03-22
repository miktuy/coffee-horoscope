import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GENERATION_RUN_STATUSES } from "@/types/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadMigration(): string {
  const migrationPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20260322193000_coffee_horoscope_schema.sql",
  );
  return readFileSync(migrationPath, "utf8");
}

describe("coffee_horoscope_schema.sql", () => {
  const sql = loadMigration();

  it("defines all core tables", () => {
    expect(sql).toMatch(/CREATE TABLE public\.zodiac_signs/i);
    expect(sql).toMatch(/CREATE TABLE public\.coffee_profiles/i);
    expect(sql).toMatch(/CREATE TABLE public\.generations_runs/i);
    expect(sql).toMatch(/CREATE TABLE public\.daily_horoscopes/i);
  });

  it("enforces one horoscope per sign per date", () => {
    expect(sql).toMatch(
      /UNIQUE\s*\(\s*zodiac_sign_id\s*,\s*horoscope_date\s*\)/i,
    );
  });

  it("constrains generation run status values", () => {
    for (const status of GENERATION_RUN_STATUSES) {
      expect(sql).toContain(status);
    }
  });

  it("requires inclusive batch date order date_from <= date_to", () => {
    expect(sql).toMatch(/date_from\s*<=\s*date_to/i);
  });

  it("includes updated_at triggers", () => {
    expect(sql).toMatch(/set_updated_at/i);
    expect(sql).toMatch(/BEFORE UPDATE/i);
  });
});
