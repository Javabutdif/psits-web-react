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
import { School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampusBreakdownEntry } from "@/features/events/types/event.types";

interface CampusYearLevelBreakdownProps {
  campusBreakdown: CampusBreakdownEntry[];
}

const YEAR_COLORS = ["#0E4A67", "#1E7AA8", "#2E9AD1", "#8ABFDB"];

const YEAR_LABELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const CampusYearLevelBreakdown: React.FC<
  CampusYearLevelBreakdownProps
> = ({ campusBreakdown }) => {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
        <School className="h-4 w-4 text-[#0E4A67]" />
        Registrations by Campus & Year Level
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campusBreakdown.map((entry) => {
          const displayName =
            entry.campus === "UC_CS" ? "UC_MAIN CS" : entry.campus;
          const chartData = [
            {
              year: "1st",
              count: entry.yearLevelDistribution["1st"],
            },
            {
              year: "2nd",
              count: entry.yearLevelDistribution["2nd"],
            },
            {
              year: "3rd",
              count: entry.yearLevelDistribution["3rd"],
            },
            {
              year: "4th",
              count: entry.yearLevelDistribution["4th"],
            },
          ];

          return (
            <Card
              key={entry.campus}
              className="rounded-3xl border border-slate-200/80 bg-white/90 pt-5 shadow-sm"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(_, index) => YEAR_LABELS[index] || _}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          fontSize: "12px",
                          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
                        }}
                        labelFormatter={(_, payload) => {
                          const index = chartData.findIndex(
                            (d) => d.year === payload?.[0]?.payload?.year
                          );
                          return YEAR_LABELS[index] || "";
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Students"
                        radius={[10, 10, 0, 0]}
                      >
                        {chartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={YEAR_COLORS[index % YEAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
