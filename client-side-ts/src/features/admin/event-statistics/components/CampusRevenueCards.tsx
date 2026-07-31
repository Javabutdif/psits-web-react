import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampusBreakdownEntry } from "@/features/events/types/event.types";

interface CampusRevenueCardsProps {
  campusBreakdown: CampusBreakdownEntry[];
}

const CAMPUS_COLORS: Record<string, string> = {
  "UC_MAIN": "#0E4A67",
  "UC_LM": "#1E7AA8",
  "UC_BANILAD": "#2E9AD1",
  "UC_PT": "#8ABFDB",
  "UC_CS": "#B8D9EC",
};

const DEFAULT_COLOR = "#9AAFC2";

export const CampusRevenueCards: React.FC<CampusRevenueCardsProps> = ({
  campusBreakdown,
}) => {
  const chartData = campusBreakdown.map((entry) => ({
    ...entry,
    label:
      entry.campus === "UC_CS"
        ? "UC Main CS"
        : entry.campus.replace("UC-", "UC "),
    color: CAMPUS_COLORS[entry.campus] || DEFAULT_COLOR,
  }));

  const hasData = chartData.some((entry) => entry.revenue > 0);

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/90 pt-5 shadow-sm">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Landmark className="h-4 w-4 text-[#0E4A67]" />
            Campus Revenue & Sales
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {chartData.map((entry) => (
              <div
                key={entry.campus}
                className="bg-muted/60 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-slate-600"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.label}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        <div className="h-[280px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  tickFormatter={(value) =>
                    value === 0 ? "0" : `₱${Math.round(Number(value) / 1000)}k`
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 26px rgba(15, 23, 42, 0.12)",
                  }}
                  formatter={(value: number | string, name) => {
                    if (name === "revenue") {
                      return [`₱${Number(value).toLocaleString()}`, "Revenue"];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="revenue" radius={[12, 12, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.campus} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                No campus revenue data
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {chartData.map((entry) => (
            <div
              key={entry.campus}
              className="bg-muted/30 space-y-1 rounded-2xl border border-slate-200/70 px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-700">
                {entry.label}
              </p>
              <p className="text-muted-foreground text-xs">
                Registrations: {entry.registrations.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">
                Units Sold: {entry.unitsSold.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Revenue: ₱{entry.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
