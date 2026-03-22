# Kaggle datasets for `coffee_profiles`

Two complementary sources are stored under this folder (see subdirectories).

## 1. Coffee reviews (text, origin, roast) — **primary**

- **Kaggle:** [`xinowo/coffee-reviews-feb-1997-mar-2025`](https://www.kaggle.com/datasets/xinowo/coffee-reviews-feb-1997-mar-2025)
- **Files:**
  - `coffee-reviews/coffee_reviews_parsed.csv` — **use this for seeding**: columns include `Blind Assessment`, `Notes`, `Bottom Line`, `Coffee Origin`, `Roast Level`, `Agtron`, sensory scores (`Aroma`, `Flavor`, `Body`, …), `Roaster`, `Coffee Name`, etc.
  - `coffee-reviews/coffee_review_raw_texts.csv` — optional; larger raw HTML/text if you need unparsed copy.

**Why:** Rich **tasting language** plus **origin** and **roast-related** fields (incl. Agtron) in one table.

**License:** Listed on Kaggle as **Unknown** — confirm terms before shipping derived content to production.

## 2. CQI Arabica (structured cupping + origin/process) — **secondary**

- **Kaggle:** [`fatihb/coffee-quality-data-cqi`](https://www.kaggle.com/datasets/fatihb/coffee-quality-data-cqi)
- **File:** `coffee-quality-cqi/df_arabica_clean.csv` — **41** columns: country/region, variety, processing, altitude, **cupping score dimensions** (aroma, flavor, acidity, body, balance, …), defects, etc.

**Why:** Strong **metadata** and **numeric sensory profile** to complement review prose from (1).

**License:** “Other (specified in description)” on Kaggle — follow dataset page and CQI/scraper attribution.

## Mapping hints (`coffee_profiles`)

| Column / idea | Source |
|----------------|--------|
| `display_name` | `Coffee Name`, or blend of `Roaster` + short name from reviews CSV |
| `description` | `Blind Assessment`, `Bottom Line`, or `Notes` (reviews) |
| `flavor_notes` | Parse keywords from `Blind Assessment` / `Notes`, or bucket CQI score columns into tags |
| `metadata` | `Coffee Origin`, `Roast Level`, `Agtron`, processing/altitude/country from CQI CSV |

## Re-downloading locally

Large CSVs under `coffee-reviews/` are **gitignored** (see repo `.gitignore`). After clone, run:

```bash
npm run data:kaggle
```

Requires [Kaggle API credentials](https://www.kaggle.com/docs/api) (`~/.kaggle/kaggle.json`) and `pip install kaggle` so the `kaggle` CLI is on your `PATH`.

The small CQI file is committed so the repo stays usable without Kaggle.

## Preview (EN + RU, no DB)

```bash
npm run preview:coffee-import-ru
```

Prints **10** sample rows (5 CQI + 5 CoffeeReview) with **original** and **Russian-normalized** fields.

## Import into Supabase (`coffee_profiles`)

Database writes require **`COFFEE_IMPORT_ALLOW_DB=true`**. Otherwise the importer exits unless you use **`--dry-run`**.

```bash
npm run import:coffee-profiles -- --dry-run --source=cqi
COFFEE_IMPORT_ALLOW_DB=true npm run import:coffee-profiles -- --source=all --limit=1000
```

See `scripts/import-coffee-profiles.ts` for flags (`--source`, `--limit`, `--batch`).
