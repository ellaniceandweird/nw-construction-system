/**
 * The single source of truth for "today" across the whole app — always
 * the real current date, normalized to America/New_York (Eastern) time,
 * regardless of what timezone the server or the viewer's browser is in.
 *
 * Construction schedules, maintenance due-dates, and "behind schedule"
 * calculations should all agree on the same "today" — this replaces the
 * hardcoded `new Date("2026-07-10")` that was scattered across several
 * files and had silently frozen the whole app on that one date.
 */
export function getTodayInNewYork(): Date {
  const now = new Date();
  // en-CA locale formats as YYYY-MM-DD, which is easy to parse back reliably.
  const nyDateString = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return new Date(`${nyDateString}T00:00:00`);
}

/** Same as getTodayInNewYork(), but as a "YYYY-MM-DD" string — handy for direct comparisons against stored date strings. */
export function getTodayInNewYorkString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Formats the real current moment (date + time) in America/New_York, for "Generated on…" style timestamps — e.g. print headers. Always reflects real Eastern time regardless of the server's or viewer's own timezone. */
export function formatNowInNewYork(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }) + " ET";
}
