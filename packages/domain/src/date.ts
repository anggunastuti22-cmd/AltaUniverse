/**
 * Timezone-aware calendar-day helpers. Pure and dependency-free.
 *
 * These underpin "one entry per local day" rules (e.g. daily check-in) without
 * pulling in a date library or any framework code.
 */

/** Returns a stable `YYYY-MM-DD` key for the given instant in a timezone. */
export function toDateKey(date: Date, timeZone?: string): string {
  // `en-CA` formats as YYYY-MM-DD.
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/** True when two instants fall on the same calendar day in a timezone. */
export function isSameDay(a: Date, b: Date, timeZone?: string): boolean {
  return toDateKey(a, timeZone) === toDateKey(b, timeZone);
}
