import type { MembershipReportRow } from "../types/reports.types";

/** Matches a generated code, e.g. "2026-000241". */
const SEQUENTIAL_CODE = /^(\d{4})-(\d+)$/;

export const parseSequentialCode = (
  code?: string | null
): { year: number; seq: number } | null => {
  const match = SEQUENTIAL_CODE.exec(String(code ?? "").trim());
  return match ? { year: Number(match[1]), seq: Number(match[2]) } : null;
};

const toTime = (value: string | Date | undefined): number | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

/**
 * Calendar year in Asia/Manila, matching the server — a record approved late on
 * 31 December belongs to that year's sequence, not the viewer's local one.
 */
const manilaYear = (time: number): number =>
  Number(
    new Date(time).toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
    })
  );

/** Which year's sequence a record belongs to; null when its date is unusable. */
export const membershipYearOf = (
  value: string | Date | undefined
): number | null => {
  const time = toTime(value);
  return time === null ? null : manilaYear(time);
};

/**
 * How many records sit after this one in its own year, by date.
 *
 * Ordering is by date, not by the numeric part of the code: most records carry
 * an old randomized code, and counting only sequential ones would report zero
 * and leave the toggle permanently disabled. Everything dated after this record
 * counts, whatever code it currently holds.
 *
 * This is the ceiling on what a cascade could ever touch, independent of what
 * has been typed — which is what tells the dialog whether a better code would
 * help or whether this row simply has nothing behind it.
 */
export const countRecordsAfter = (
  rows: MembershipReportRow[],
  selfId: string,
  selfDate: string | Date | undefined
): number => {
  const selfTime = toTime(selfDate);
  if (selfTime === null) return 0;
  const year = manilaYear(selfTime);

  return rows.filter((row) => {
    if (row._id === selfId) return false;
    const time = toTime(row.date);
    if (time === null || manilaYear(time) !== year) return false;
    // Ties on identical timestamps fall back to id, as they do on the server.
    return time > selfTime || (time === selfTime && row._id > selfId);
  }).length;
};

/**
 * How many records a cascade would actually renumber, mirroring the server's
 * rule: the target has to be a sequential code for the record's own year.
 */
export const countFollowingRecords = (
  rows: MembershipReportRow[],
  selfId: string,
  typedCode: string,
  selfDate: string | Date | undefined
): number => {
  const typed = parseSequentialCode(typedCode);
  const selfYear = membershipYearOf(selfDate);

  // Cascading needs a sequential target and a placeable record, and the server
  // refuses to move a record across years.
  if (!typed || selfYear === null || selfYear !== typed.year) return 0;

  return countRecordsAfter(rows, selfId, selfDate);
};
