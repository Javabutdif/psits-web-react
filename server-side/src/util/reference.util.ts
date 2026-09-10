import { Counter } from "../models/counter.model";

const TIMEZONE = "Asia/Manila";
const SEQUENCE_PAD = 6;

/**
 * Calendar year in Asia/Manila rather than the server's local year — otherwise an
 * approval late on 31 December lands in the wrong year's sequence.
 */
export const manilaYear = (date: Date = new Date()): number =>
  Number(
    date.toLocaleString("en-US", { timeZone: TIMEZONE, year: "numeric" })
  );

export const membershipCounterKey = (year: number): string =>
  `membership-${year}`;

export const formatMembershipReference = (
  year: number,
  seq: number
): string => `${year}-${String(seq).padStart(SEQUENCE_PAD, "0")}`;

/**
 * Atomically claims the next number in the current year's sequence.
 *
 * `$inc` with `upsert` yields `seq: 1` for a year that has no counter yet, so each
 * new year starts at 1 with no rollover logic. 2026 is pre-seeded to 240 by
 * `scripts/seed-membership-counter.ts` so its first code is 2026-000241.
 *
 * Call this OUTSIDE the approval transaction: a rolled-back approval burns a number
 * (gaps are accepted), but holding the counter inside the transaction would cause
 * write conflicts when two admins approve at once.
 */
export const nextMembershipReference = async (
  date: Date = new Date()
): Promise<string> => {
  const year = manilaYear(date);
  const counter = await Counter.findOneAndUpdate(
    { _id: membershipCounterKey(year) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  return formatMembershipReference(year, counter?.seq ?? 1);
};
