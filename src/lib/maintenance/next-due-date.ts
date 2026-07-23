/**
 * Parses the real frequency text (e.g. "3-months", "1-months",
 * "2-months (monitor in spring)") into a number of months. Returns null
 * for text that doesn't contain a parseable interval rather than guessing.
 */
export function parseFrequencyMonths(frequency?: string): number | null {
  if (!frequency) return null;
  const match = frequency.match(/(\d+)\s*-?\s*month/i);
  if (match) return parseInt(match[1], 10);
  if (/twice a year|semi-?annual/i.test(frequency)) return 6;
  if (/annual|yearly|once a year/i.test(frequency)) return 12;
  return null;
}

export function computeNextDueDate(lastCompleted?: string, frequency?: string): Date | null {
  const months = parseFrequencyMonths(frequency);
  if (!lastCompleted || months === null) return null;
  const date = new Date(lastCompleted);
  date.setMonth(date.getMonth() + months);
  return date;
}

export function isOverdue(lastCompleted?: string, frequency?: string): boolean {
  const date = computeNextDueDate(lastCompleted, frequency);
  return date !== null && date < new Date("2026-07-10");
}
