import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableRowsSkeletonProps {
  /** Number of columns in the table — keep in sync with the header row. */
  columns: number;
  /** Number of placeholder rows to render. */
  rows?: number;
  /** Extra classes for each placeholder row. */
  rowClassName?: string;
  /** Extra classes for each placeholder cell. */
  cellClassName?: string;
}

/**
 * Placeholder rows rendered inside an existing `<tbody>` so only the table body
 * swaps while data loads — the surrounding header, filters and stats stay put.
 */
function TableRowsSkeleton({
  columns,
  rows = 8,
  rowClassName,
  cellClassName,
}: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} className={cn("border-b border-[#ededed]", rowClassName)}>
          {Array.from({ length: columns }, (_, cell) => (
            <td key={cell} className={cn("px-2 py-3", cellClassName)}>
              <Skeleton className="h-4 w-full rounded-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export { TableRowsSkeleton };
