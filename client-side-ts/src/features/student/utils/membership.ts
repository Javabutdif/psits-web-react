export type MembershipGateStatus =
  | "active"
  | "pending"
  | "none"
  | "expired"
  | "rejected"
  | "cancelled";

const ACTIVE_STATUSES = new Set([
  "active",
  "ACTIVE",
  "RENEWED",
  "MEMBERSHIP_ACTIVE",
  "MEMBERSHIP_RENEWED",
]);

const PENDING_STATUSES = new Set([
  "pending",
  "PENDING",
  "REQUEST",
  "MEMBERSHIP_PENDING",
]);

const EXPIRED_STATUSES = new Set(["expired", "EXPIRED", "MEMBERSHIP_EXPIRED"]);

const REJECTED_STATUSES = new Set([
  "rejected",
  "REJECTED",
  "DECLINED",
  "MEMBERSHIP_REJECTED",
  "MEMBERSHIP_DECLINED",
]);

const CANCELLED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "CANCELLED",
  "CANCELED",
  "MEMBERSHIP_CANCELLED",
  "MEMBERSHIP_CANCELED",
]);

export const normalizeMembershipStatus = (
  value?: string | null
): MembershipGateStatus => {
  const status = String(value ?? "").trim();
  const upperStatus = status.toUpperCase();

  if (ACTIVE_STATUSES.has(status) || ACTIVE_STATUSES.has(upperStatus)) {
    return "active";
  }
  if (PENDING_STATUSES.has(status) || PENDING_STATUSES.has(upperStatus)) {
    return "pending";
  }
  if (EXPIRED_STATUSES.has(status) || EXPIRED_STATUSES.has(upperStatus)) {
    return "expired";
  }
  if (REJECTED_STATUSES.has(status) || REJECTED_STATUSES.has(upperStatus)) {
    return "rejected";
  }
  if (CANCELLED_STATUSES.has(status) || CANCELLED_STATUSES.has(upperStatus)) {
    return "cancelled";
  }

  return "none";
};

export const isActiveMembership = (value?: string | null) =>
  normalizeMembershipStatus(value) === "active";
