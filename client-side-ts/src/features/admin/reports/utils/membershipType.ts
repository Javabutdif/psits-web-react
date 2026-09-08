/**
 * Membership type is stored in two vocabularies: the live v2 controller writes
 * `MEMBERSHIP_TYPE_MEMBER` / `MEMBERSHIP_TYPE_RENEWAL`, while legacy rows may
 * hold the plain `Membership` / `Renewal` strings. Match and display both.
 */
const MEMBER_VALUES = new Set(["MEMBERSHIP_TYPE_MEMBER", "MEMBERSHIP", "MEMBER"]);
const RENEWAL_VALUES = new Set(["MEMBERSHIP_TYPE_RENEWAL", "RENEWAL", "RENEWED"]);

export type MembershipTypeKey = "member" | "renewal" | "unknown";

export const normalizeMembershipType = (
  value?: string | null
): MembershipTypeKey => {
  const key = String(value ?? "").trim().toUpperCase();
  if (MEMBER_VALUES.has(key)) return "member";
  if (RENEWAL_VALUES.has(key)) return "renewal";
  return "unknown";
};

/** Human-readable label; unrecognized values are returned unchanged. */
export const formatMembershipType = (value?: string | null): string => {
  switch (normalizeMembershipType(value)) {
    case "member":
      return "Membership";
    case "renewal":
      return "Renewal";
    default:
      return value ? String(value) : "-";
  }
};

/** Dropdown options — `value` is the stored enum, so filtering actually matches. */
export const MEMBERSHIP_TYPE_OPTIONS = [
  { value: "MEMBERSHIP_TYPE_MEMBER", label: "Membership" },
  { value: "MEMBERSHIP_TYPE_RENEWAL", label: "Renewal" },
] as const;

/** True when a row matches the selected filter, comparing normalized values. */
export const matchesMembershipType = (
  rowType: string | undefined,
  filterType: string
): boolean =>
  normalizeMembershipType(rowType) === normalizeMembershipType(filterType);
