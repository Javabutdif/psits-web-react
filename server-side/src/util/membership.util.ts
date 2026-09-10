import { membership_term } from "../enums/status.enums";

export type MembershipGateStatus =
  | "active"
  | "pending"
  | "none"
  | "expired"
  | "rejected"
  | "cancelled";

export const ACTIVE_STATUSES = new Set([
  "ACTIVE",
  "RENEWED",
  "MEMBERSHIP_ACTIVE",
  "MEMBERSHIP_RENEWED",
]);

export const PENDING_STATUSES = new Set([
  "PENDING",
  "MEMBERSHIP_PENDING",
  "REQUEST",
]);

const EXPIRED_STATUSES = new Set(["EXPIRED", "MEMBERSHIP_EXPIRED"]);

const REJECTED_STATUSES = new Set([
  "REJECTED",
  "DECLINED",
  "MEMBERSHIP_REJECTED",
  "MEMBERSHIP_DECLINED",
]);

const CANCELLED_STATUSES = new Set([
  "CANCELLED",
  "CANCELED",
  "MEMBERSHIP_CANCELLED",
  "MEMBERSHIP_CANCELED",
]);

export const normalizeMembershipStatus = (
  value?: string | null
): MembershipGateStatus => {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  if (ACTIVE_STATUSES.has(status)) return "active";
  if (PENDING_STATUSES.has(status)) return "pending";
  if (EXPIRED_STATUSES.has(status)) return "expired";
  if (REJECTED_STATUSES.has(status)) return "rejected";
  if (CANCELLED_STATUSES.has(status)) return "cancelled";

  return "none";
};

export const hasActiveMembership = (value?: string | null) =>
  normalizeMembershipStatus(value) === "active";

/**
 * Human-readable term name for receipts. Returns "" for an unknown or missing
 * term so callers can decide whether to omit the segment entirely.
 */
export const membershipTermLabel = (term?: string | null): string => {
  switch (String(term ?? "").trim()) {
    case membership_term.FIRST:
      return "1st Semester";
    case membership_term.SECOND:
      return "2nd Semester";
    default:
      return "";
  }
};

/**
 * Receipt-facing reference: "2026-000050-1st Semester".
 *
 * Display only — the stored `reference_code` keeps its "YYYY-NNNNNN" form, so
 * lookups, the sequence counter and the reference-edit flow are unaffected.
 * Falls back to the bare code when the term cannot be resolved (legacy history
 * rows with no `membership_id`, or a term outside the enum) rather than
 * rendering a dangling "-".
 */
export const formatReceiptReference = (
  referenceCode: string,
  term?: string | null
): string => {
  const label = membershipTermLabel(term);
  return label ? `${referenceCode}-${label}` : referenceCode;
};
