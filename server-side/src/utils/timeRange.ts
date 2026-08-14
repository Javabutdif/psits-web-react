/**
 * Parses a time range string into 24h minute-of-day bounds.
 *
 * Supports both:
 *  - 24-hour format: "07:30 - 12:00"
 *  - 12-hour format: "7:00 AM - 12:00 PM"
 *
 * Returns null if the range cannot be parsed.
 */
export function parseTimeRangeToMinutes(
  timeRange: string
): { startMinutes: number; endMinutes: number } | null {
  const [startRaw, endRaw] = timeRange.split("-").map((s) => s.trim());
  if (!startRaw || !endRaw) return null;

  const toMinutes = (raw: string): number | null => {
    // Try 24-hour format first: "07:30", "13:00"
    const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hour = parseInt(match24[1], 10);
      const minute = parseInt(match24[2], 10);
      if (hour > 23 || minute > 59) return null;
      return hour * 60 + minute;
    }

    // Fall back to 12-hour format: "7:30 AM", "12:00 PM"
    const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let hour = parseInt(match12[1], 10);
      const minute = parseInt(match12[2], 10);
      const meridiem = match12[3].toUpperCase();

      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      return hour * 60 + minute;
    }

    return null;
  };

  const startMinutes = toMinutes(startRaw);
  const endMinutes = toMinutes(endRaw);
  if (startMinutes === null || endMinutes === null) return null;

  return { startMinutes, endMinutes };
}