import { useState, useEffect } from "react";
import { getMembershipRevenue } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueEntry {
  month: number;
  year: number;
  total: number;
  count: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const RevenuePanel = () => {
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembershipRevenue()
      .then(setRevenue)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
  const totalCount = revenue.reduce((sum, r) => sum + r.count, 0);
  const avgRevenue = totalCount > 0 ? totalRevenue / totalCount : 0;

  const chartData = revenue.map((r) => ({
    name: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
    revenue: r.total,
    count: r.count,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Revenue</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(totalRevenue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Memberships</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">{totalCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Average</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(avgRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
        <h3 className="mb-4 text-sm font-medium text-[#2b2b2b]">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `PHP ${value / 1000}k`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value),
                name === "revenue" ? "Revenue" : "Memberships",
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#1c9dde" name="Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="count" fill="#86efac" name="Memberships" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {revenue.length === 0 && (
        <p className="py-16 text-center text-sm text-[#777]">No membership revenue data found.</p>
      )}
    </div>
  );
};