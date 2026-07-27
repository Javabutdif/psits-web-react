export type MembershipGateStatus =
  | "active"
  | "pending"
  | "none"
  | "expired"
  | "rejected"
  | "cancelled";

const ACTIVE_STATUSES = new Set([
  "ACTIVE",
  "RENEWED",
  "MEMBERSHIP_ACTIVE",
  "MEMBERSHIP_RENEWED",
]);

const PENDING_STATUSES = new Set(["PENDING", "MEMBERSHIP_PENDING", "REQUEST"]);

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
