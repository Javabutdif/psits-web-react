import logo from "@/assets/logo.png";
import type { PrintableOrderReceipt as PrintableOrderReceiptData } from "../types/orders.types";

interface PrintableOrderReceiptProps {
  receipt: PrintableOrderReceiptData | null;
}

const formatCurrency = (value?: number) =>
  `\u20B1${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value?: string | Date) => {
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

const formatList = (value?: string[]) => {
  if (!value || value.length === 0) return "-";
  return value.join(", ");
};

export const PrintableOrderReceipt = ({
  receipt,
}: PrintableOrderReceiptProps) => {
  if (!receipt) return null;

  return (
    <div className="order-receipt-print-shell" aria-hidden="true">
      <style>
        {`
          .order-receipt-print-shell {
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

            .order-receipt-print-shell,
            .order-receipt-print-shell * {
              visibility: visible !important;
            }

            .order-receipt-print-shell {
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

      <div className="px-2 py-3 text-[11px] leading-tight">
        <div className="mb-3 flex items-center gap-3">
          <img
            src={logo}
            alt="PSITS"
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold leading-none">Official</p>
            <p className="text-lg font-semibold leading-none">Receipt</p>
            <p className="mt-1 text-[10px] text-neutral-500">Order Copy</p>
          </div>
        </div>

        <div className="mb-3 border-b border-dashed border-neutral-300 pb-3">
          <p className="text-xs font-semibold">University of Cebu Main Campus</p>
          <p className="text-[10px] text-neutral-600">
            Sanciangko Street Cebu City, 6000
          </p>
        </div>

        <div className="space-y-1 border-b border-dashed border-neutral-300 pb-3">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {receipt.student_name || "-"}
          </p>
          <p>
            <span className="font-semibold">Student ID:</span>{" "}
            {receipt.id_number || "-"}
          </p>
          <p>
            <span className="font-semibold">Course & Year:</span>{" "}
            {receipt.course || "-"} {receipt.year ? `- ${receipt.year}` : ""}
          </p>
          <p>
            <span className="font-semibold">Reference:</span>{" "}
            {receipt.reference_code || "-"}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formatDateTime(receipt.transaction_date || receipt.order_date)}
          </p>
          <p>
            <span className="font-semibold">Managed by:</span>{" "}
            {receipt.admin || "-"}
          </p>
        </div>

        {receipt.membership_discount || receipt.promo_name ? (
          <div className="space-y-1 border-b border-dashed border-neutral-300 py-3">
            {receipt.membership_discount ? (
              <p>
                <span className="font-semibold">Membership:</span> Discounted
              </p>
            ) : null}
            {receipt.promo_name ? (
              <p>
                <span className="font-semibold">Promo:</span>{" "}
                {receipt.promo_name}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="border-b border-dashed border-neutral-300 py-3">
          <p className="mb-2 font-semibold">Items</p>
          <div className="space-y-3">
            {receipt.items.map((item, index) => (
              <div key={`${item.product_name}-${index}`}>
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="shrink-0 font-semibold">
                    {formatCurrency(item.sub_total)}
                  </p>
                </div>
                <p className="text-[10px] text-neutral-600">
                  Qty {item.quantity}
                  {item.price !== undefined
                    ? ` x ${formatCurrency(item.price)}`
                    : ""}
                </p>
                <p className="text-[10px] text-neutral-600">
                  Batch: {item.batch ?? "-"} | Size: {formatList(item.sizes)} |
                  Variation: {formatList(item.variation)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 border-b border-dashed border-neutral-300 py-3">
          <div className="flex justify-between">
            <span>Cash</span>
            <span>{formatCurrency(receipt.cash)}</span>
          </div>
          <div className="flex justify-between">
            <span>Change</span>
            <span>{formatCurrency(receipt.change)}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold">
            <span>Total</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>
        </div>

        <div className="pt-3 text-center">
          <p className="text-xs font-semibold">{receipt.reference_code}</p>
          <p className="mt-1 text-[10px] text-neutral-500">
            Thank you for your purchase!
          </p>
          <p className="mt-1 text-[9px] text-neutral-400">
            PSITS - University of Cebu Main Campus
          </p>
        </div>
      </div>
    </div>
  );
};
