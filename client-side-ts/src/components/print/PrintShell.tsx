import type { ReactNode } from "react";

interface PrintShellProps {
  /** Receipt body. Nothing renders while this is null. */
  children: ReactNode;
}

/**
 * Parks a receipt off-screen and, while printing, hides the rest of the page so
 * only the receipt reaches the printer.
 *
 * `body *` is hidden globally, so only one shell may be mounted at a time.
 */
export const PrintShell = ({ children }: PrintShellProps) => {
  if (!children) return null;

  return (
    <div className="receipt-print-shell" aria-hidden="true">
      <style>
        {`
          .receipt-print-shell {
            position: fixed;
            left: -10000px;
            top: 0;
            width: 80mm;
            background: #fff;
            color: #111;
            font-family: Inter, Arial, sans-serif;
            pointer-events: none;
          }

          @media print {
            @page {
              size: 80mm 297mm;
              margin: 4mm;
            }

            body * {
              visibility: hidden !important;
            }

            .receipt-print-shell,
            .receipt-print-shell * {
              visibility: visible !important;
            }

            .receipt-print-shell {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 72mm !important;
              padding: 0 !important;
              margin: 0 !important;
              pointer-events: auto !important;
            }
          }
        `}
      </style>
      {children}
    </div>
  );
};
