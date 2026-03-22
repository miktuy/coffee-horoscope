const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses `value` as a UTC calendar date; returns null if invalid. */
export function parseIsoDateOnly(value: string): Date | null {
  if (!isValidIsoDateString(value)) return null;
  const [y, m, day] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

/** True when `value` is `YYYY-MM-DD` and refers to a real calendar day in UTC. */
export function isValidIsoDateString(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, day] = value.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() === m - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Validates an inclusive generation window [from, to] using ISO date strings.
 * Mirrors `generations_runs.date_from <= date_to` in SQL.
 */
export function isValidGenerationDateRange(from: string, to: string): boolean {
  if (!isValidIsoDateString(from) || !isValidIsoDateString(to)) return false;
  return from <= to;
}
