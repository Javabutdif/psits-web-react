export const formatReceiptCurrency = (value?: number) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatReceiptDateTime = (value?: string | Date) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Human-readable term name for receipts. Returns "" for an unknown or missing
 * term so callers can omit the segment entirely.
 */
export const formatReceiptTerm = (term?: string) => {
  switch ((term ?? "").trim()) {
    case "MEMBERSHIP_TERM_FIRST":
      return "1st Semester";
    case "MEMBERSHIP_TERM_SECOND":
      return "2nd Semester";
    default:
      return "";
  }
};

/**
 * Receipt-facing reference: "2026-000050-1st Semester".
 *
 * Display only — the stored reference_code keeps its "YYYY-NNNNNN" form. Falls
 * back to the bare code when the term is missing (legacy history rows with no
 * membership_id) rather than rendering a dangling "-".
 * Mirrors `formatReceiptReference` in server-side/src/util/membership.util.ts.
 */
export const formatReceiptReference = (
  referenceCode?: string,
  term?: string
) => {
  if (!referenceCode) return "-";
  const label = formatReceiptTerm(term);
  return label ? `${referenceCode}-${label}` : referenceCode;
};

export const formatReceiptList = (value?: string[]) => {
  if (!value || value.length === 0) return "-";
  return value.join(", ");
};
