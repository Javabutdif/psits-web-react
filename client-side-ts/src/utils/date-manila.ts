import { isValid } from "date-fns";

const MANILA_TIMEZONE = "Asia/Manila";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIMEZONE,
});

export const parseDateInputToManilaDate = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const iso = `${value}T00:00:00+08:00`;
  const parsed = new Date(iso);
  return isValid(parsed) ? parsed : null;
};

export const formatEventDateKey = (value: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIMEZONE,
  }).format(value);

export const formatEventDateLabel = (value: Date | string | null | undefined): string => {
  if (!value) return "TBA";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "TBA";
  return formatter.format(date);
};

export const getManilaStartOfDay = (date = new Date()): Date => {
  if (!date || Number.isNaN(date.getTime())) return new Date(0);
  const [year, month, day] = formatEventDateKey(date)
    .split("-")
    .map(Number);
  return new Date(year, month - 1, day);
};

export const isSameManilaCalendarDate = (a: Date, b: Date): boolean =>
  formatEventDateKey(a) === formatEventDateKey(b);
