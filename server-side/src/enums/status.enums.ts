export const account_status = Object.freeze({
  ACTIVE: "STATUS_ACTIVE",
  DELETED: "STATUS_DELETED",
  SUSPENDED: "STATUS_SUSPENDED",
  PENDING: "STATUS_PENDING",
});

// Rows written before account_status existed store the plain string "True".
// Read paths tolerate both so those students keep working; writers must always
// use account_status.ACTIVE. Drop the legacy value once stored data has been
// migrated.
export const active_status_values: readonly string[] = [account_status.ACTIVE];

export const membership_status = Object.freeze({
  ACTIVE: "MEMBERSHIP_ACTIVE",
  PENDING: "MEMBERSHIP_PENDING",
  NONE: "MEMBERSHIP_NONE",
});
export const membership_term = Object.freeze({
  FIRST: "MEMBERSHIP_TERM_FIRST",
  SECOND: "MEMBERSHIP_TERM_SECOND",
});
