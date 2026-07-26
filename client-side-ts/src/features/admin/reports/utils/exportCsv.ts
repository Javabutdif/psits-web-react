/**
 * Client-side CSV export using a native Blob + object URL.
 * Deliberately avoids `react-csv` — excluded per the admin frontend
 * migration plan's Phase 7 notes (avoid new deps where existing
 * capability covers it).
 */
export const downloadCsv = (
  rows: Array<Record<string, unknown>>,
  filename: string
): void => {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const escapeCell = (value: unknown): string => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};