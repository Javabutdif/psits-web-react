import { useState, useEffect } from "react";
import { getStockAlerts } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package, AlertCircle } from "lucide-react";

interface StockAlert {
  _id: string;
  name: string;
  stocks: number;
  price: number;
  is_active: boolean;
  category: string;
  warning: string;
}

export const StockAlertPanel = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockAlerts()
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No stock alerts. All items are well-stocked.</p>;
  }

  const outOfStock = alerts.filter((a) => a.stocks === 0).length;
  const lowStock = alerts.filter((a) => a.stocks > 0 && a.stocks <= 5).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-xs font-medium text-red-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-700">{outOfStock}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-orange-600">Low Stock</p>
              <p className="text-2xl font-semibold text-orange-700">{lowStock}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-blue-600">Total Alerts</p>
              <p className="text-2xl font-semibold text-blue-700">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[30%] rounded-l-md px-3 py-2 text-left font-medium">Product</th>
              <th className="w-[15%] px-3 py-2 text-left font-medium">Category</th>
              <th className="w-[12%] px-3 py-2 text-right font-medium">Stock</th>
              <th className="w-[15%] px-3 py-2 text-right font-medium">Price</th>
              <th className="w-[20%] px-3 py-2 text-center font-medium">Status</th>
              <th className="w-[8%] rounded-r-md px-3 py-2 text-center font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert._id} className="border-b border-[#ededed] text-[#303030] hover:bg-[#fafafa]">
                <td className="px-3 py-3 font-medium">{alert.name}</td>
                <td className="px-3 py-3 text-[#777]">{alert.category}</td>
                <td className="px-3 py-3 text-right font-mono">
                  <span className={alert.stocks === 0 ? "text-red-600 font-semibold" : "text-orange-600"}>
                    {alert.stocks}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(alert.price)}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    alert.stocks === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {alert.stocks === 0 ? <AlertCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {alert.warning}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    alert.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {alert.is_active ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};