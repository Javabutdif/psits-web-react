import { useState, useEffect } from "react";
import { getRefundQueue } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Receipt } from "lucide-react";

interface Refund {
  _id: string;
  refund_id: string;
  order_reference: string;
  product_name: string;
  refund_price: number;
  refund_admin: string;
  refund_date: string;
}

export const RefundQueuePanel = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRefundQueue(50)
      .then(setRefunds)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (refunds.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No refund records found.</p>;
  }

  const totalRefunded = refunds.reduce((sum, r) => sum + r.refund_price, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Refunds</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">{refunds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Amount</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(totalRefunded)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[15%] rounded-l-md px-3 py-2 text-left font-medium">Refund ID</th>
              <th className="w-[15%] px-3 py-2 text-left font-medium">Order Ref</th>
              <th className="w-[25%] px-3 py-2 text-left font-medium">Product</th>
              <th className="w-[15%] px-3 py-2 text-right font-medium">Amount</th>
              <th className="w-[15%] px-3 py-2 text-left font-medium">Admin</th>
              <th className="w-[15%] rounded-r-md px-3 py-2 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund._id} className="border-b border-[#ededed] hover:bg-gray-50">
                <td className="px-3 py-3 font-mono text-xs">{refund.refund_id}</td>
                <td className="px-3 py-3 font-mono text-xs">{refund.order_reference}</td>
                <td className="px-3 py-3">{refund.product_name}</td>
                <td className="px-3 py-3 text-right font-medium">
                  {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(refund.refund_price)}
                </td>
                <td className="px-3 py-3">{refund.refund_admin}</td>
                <td className="px-3 py-3 text-sm text-gray-500">
                  {new Date(refund.refund_date).toLocaleDateString("en-PH")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};