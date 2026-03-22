import { describe, expect, it } from "vitest";

import {
  isValidGenerationDateRange,
  isValidIsoDateString,
  parseIsoDateOnly,
} from "./generationRun";

describe("isValidIsoDateString", () => {
  it("accepts valid calendar dates", () => {
    expect(isValidIsoDateString("2026-03-22")).toBe(true);
    expect(isValidIsoDateString("2024-02-29")).toBe(true);
  });

  it("rejects invalid month, day, or format", () => {
    expect(isValidIsoDateString("2026-02-30")).toBe(false);
    expect(isValidIsoDateString("2026-13-01")).toBe(false);
    expect(isValidIsoDateString("26-03-22")).toBe(false);
    expect(isValidIsoDateString("2026-3-22")).toBe(false);
    expect(isValidIsoDateString("")).toBe(false);
  });
});

describe("parseIsoDateOnly", () => {
  it("returns a Date for valid input", () => {
    const d = parseIsoDateOnly("2026-01-15");
    expect(d).not.toBeNull();
    expect(d?.toISOString().startsWith("2026-01-15")).toBe(true);
  });

  it("returns null for invalid input", () => {
    expect(parseIsoDateOnly("not-a-date")).toBeNull();
    expect(parseIsoDateOnly("2026-02-30")).toBeNull();
  });
});

describe("isValidGenerationDateRange", () => {
  it("is true when from <= to", () => {
    expect(isValidGenerationDateRange("2026-01-01", "2026-01-31")).toBe(true);
    expect(isValidGenerationDateRange("2026-06-10", "2026-06-10")).toBe(true);
  });

  it("is false when from > to", () => {
    expect(isValidGenerationDateRange("2026-02-01", "2026-01-01")).toBe(false);
  });

  it("is false when either bound is invalid", () => {
    expect(isValidGenerationDateRange("2026-02-30", "2026-03-01")).toBe(false);
    expect(isValidGenerationDateRange("2026-03-01", "bad")).toBe(false);
  });
});
