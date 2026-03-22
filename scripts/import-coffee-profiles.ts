/**
 * Imports Kaggle CSV extracts into `public.coffee_profiles` (Supabase / Postgres).
 *
 * Env:
 *   SUPABASE_URL              — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role (bypasses RLS; use only locally / CI)
 *
 * Paths (override with env):
 *   COFFEE_REVIEWS_CSV — default data/raw/kaggle/coffee-reviews/coffee_reviews_parsed.csv
 *   CQI_CSV            — default data/raw/kaggle/coffee-quality-cqi/df_arabica_clean.csv
 *
 * DB writes are disabled unless COFFEE_IMPORT_ALLOW_DB=true (use preview script first).
 *
 * Usage:
 *   npx tsx scripts/import-coffee-profiles.ts --dry-run --source=cqi
 *   COFFEE_IMPORT_ALLOW_DB=true npx tsx scripts/import-coffee-profiles.ts --source=reviews --limit=5000
 */

import { createReadStream, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse";
import { parse as parseSync } from "csv-parse/sync";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CoffeeProfileInsert } from "@/lib/importers/coffeeProfiles/types";
import { cqiRowToProfile } from "@/lib/importers/coffeeProfiles/transformCqi";
import { coffeeReviewRowToProfile } from "@/lib/importers/coffeeProfiles/transformCoffeeReview";
import {
  dedupeBySlug,
  upsertCoffeeProfilesBatch,
} from "@/lib/importers/coffeeProfiles/upsert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

type Source = "all" | "cqi" | "reviews";

function argValue(name: string): string | undefined {
  const prefix = `${name}=`;
  const raw = process.argv.find((a) => a.startsWith(prefix));
  return raw?.slice(prefix.length);
}

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const source = (argValue("--source") ?? "all") as Source;
  const limit = argValue("--limit") ? Number(argValue("--limit")) : undefined;
  const batch = argValue("--batch") ? Number(argValue("--batch")) : 250;
  if (!["all", "cqi", "reviews"].includes(source)) {
    throw new Error(`Invalid --source=${source}`);
  }
  if (limit !== undefined && (!Number.isFinite(limit) || limit < 0)) {
    throw new Error("Invalid --limit");
  }
  if (!Number.isFinite(batch) || batch < 1) {
    throw new Error("Invalid --batch");
  }
  return { dryRun, source, limit, batch };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function makeClient(): SupabaseClient {
  if (process.env.COFFEE_IMPORT_ALLOW_DB !== "true") {
    throw new Error(
      "Database import is disabled. Set COFFEE_IMPORT_ALLOW_DB=true after reviewing preview:coffee-import-ru output.",
    );
  }
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function upsertChunks(
  client: SupabaseClient | null,
  dryRun: boolean,
  rows: CoffeeProfileInsert[],
  batch: number,
): Promise<number> {
  let done = 0;
  for (let i = 0; i < rows.length; i += batch) {
    const slice = dedupeBySlug(rows.slice(i, i + batch));
    if (slice.length === 0) continue;
    if (!dryRun && client) {
      await upsertCoffeeProfilesBatch(client, slice);
    }
    done += slice.length;
  }
  return done;
}

async function importCqi(
  csvPath: string,
  options: {
    dryRun: boolean;
    client: SupabaseClient | null;
    limit?: number;
    batch: number;
  },
): Promise<number> {
  const text = readFileSync(csvPath, "utf8");
  const rows = parseSync(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  }) as Record<string, string>[];

  const profiles: CoffeeProfileInsert[] = [];
  for (const row of rows) {
    const p = cqiRowToProfile(row);
    if (p) profiles.push(p);
  }

  const capped =
    options.limit !== undefined ? profiles.slice(0, options.limit) : profiles;

  return upsertChunks(options.client, options.dryRun, capped, options.batch);
}

async function importReviewsStream(
  csvPath: string,
  options: {
    dryRun: boolean;
    client: SupabaseClient | null;
    limit?: number;
    batch: number;
  },
): Promise<number> {
  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true,
    }),
  );

  let written = 0;
  let buffer: CoffeeProfileInsert[] = [];

  const flush = async () => {
    if (buffer.length === 0) return;
    let chunk = dedupeBySlug(buffer);
    buffer = [];
    if (options.limit !== undefined) {
      const room = options.limit - written;
      if (room <= 0) return;
      if (chunk.length > room) chunk = chunk.slice(0, room);
    }
    if (chunk.length === 0) return;
    if (!options.dryRun && options.client) {
      await upsertCoffeeProfilesBatch(options.client, chunk);
    }
    written += chunk.length;
  };

  for await (const row of parser) {
    if (options.limit !== undefined && written >= options.limit) break;

    const profile = coffeeReviewRowToProfile(row as Record<string, string>);
    if (!profile) continue;

    buffer.push(profile);

    if (buffer.length >= options.batch) {
      await flush();
    }
  }

  await flush();
  return written;
}

async function main() {
  const { dryRun, source, limit, batch } = parseArgs();

  if (!dryRun && process.env.COFFEE_IMPORT_ALLOW_DB !== "true") {
    console.error(
      "Refusing to write to the database. Use --dry-run, or set COFFEE_IMPORT_ALLOW_DB=true explicitly.",
    );
    process.exit(1);
  }

  const reviewsPath =
    process.env.COFFEE_REVIEWS_CSV ??
    path.join(ROOT, "data/raw/kaggle/coffee-reviews/coffee_reviews_parsed.csv");
  const cqiPath =
    process.env.CQI_CSV ?? path.join(ROOT, "data/raw/kaggle/coffee-quality-cqi/df_arabica_clean.csv");

  const client = dryRun ? null : makeClient();

  let total = 0;

  if (source === "cqi" || source === "all") {
    console.error(`CQI: ${cqiPath}`);
    total += await importCqi(cqiPath, {
      dryRun,
      client,
      limit: source === "cqi" ? limit : undefined,
      batch,
    });
  }

  if (source === "reviews" || source === "all") {
    console.error(`Reviews: ${reviewsPath}`);
    total += await importReviewsStream(reviewsPath, {
      dryRun,
      client,
      // For --source=all, --limit caps the reviews pass only (CQI is tiny).
      limit: source === "reviews" || source === "all" ? limit : undefined,
      batch,
    });
  }

  console.log(
    dryRun
      ? `[dry-run] Prepared up to ${total} coffee_profiles upserts (no DB writes).`
      : `Upserted ${total} coffee_profiles rows (batched).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
