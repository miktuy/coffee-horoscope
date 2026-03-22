import { createHash } from "node:crypto";

/** Short stable slug from arbitrary string (e.g. review URL). */
export function slugFromString(prefix: string, input: string): string {
  const hash = createHash("sha256").update(input).digest("hex").slice(0, 20);
  return `${prefix}-${hash}`;
}

const SLUG_SAFE = /[^a-z0-9]+/gi;

/** Slug segment from CQI id or similar ascii identifier. */
export function slugFromCqiId(id: string): string {
  const trimmed = id.trim();
  const safe = trimmed.replace(SLUG_SAFE, "-").replace(/^-|-$/g, "").toLowerCase();
  return safe.length > 0 ? `cqi-${safe}` : `cqi-${slugFromString("id", id).slice(3)}`;
}
