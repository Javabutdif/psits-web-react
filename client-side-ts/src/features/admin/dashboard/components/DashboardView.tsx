import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  PackageCheck,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboardData } from "../hooks/useDashboardData";
import type {
  CourseDatum,
  DashboardCounts,
  PendingOrderCount,
  PendingOrderSortField,
  PendingOrderSortRule,
  RevenueDatum,
  YearLevelDatum,
} from "../types/dashboard.types";

interface MetricCardConfig {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}

interface DashboardCardProps {
  item: MetricCardConfig;
}

interface YearLevelDonutProps {
  data: YearLevelDatum[];
  total: number;
}

interface YearLevelTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: YearLevelDatum;
  }>;
}

interface CourseBubbleChartProps {
  data: CourseDatum[];
}

interface RevenueLineChartProps {
  data: RevenueDatum[];
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: RevenueDatum;
  }>;
}

interface PendingOrdersTableProps {
  data: PendingOrderCount[];
  isLoading: boolean;
  page: number;
  search: string;
  sort: PendingOrderSortRule[];
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: PendingOrderSortRule[]) => void;
}

const cardBaseClass =
  "rounded-2xl border border-[#dedede] bg-white shadow-none";

const metricCards = (counts: DashboardCounts): MetricCardConfig[] => [
  {
    label: "On-Sale Products",
    value: counts.onSaleProducts,
    icon: PackageCheck,
  },
  {
    label: "Students",
    value: counts.students,
    icon: GraduationCap,
  },
  {
    label: "Orders",
    value: counts.orders,
    icon: ShoppingBag,
  },
  {
    label: "Active Members",
    value: counts.activeMembers,
    icon: Users,
  },
];

const formatProductName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const buildVisiblePages = (page: number, totalPages: number) => {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4];
  if (page >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [page - 1, page, page + 1];
};

const DashboardMetricCard = ({ item }: DashboardCardProps) => {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        cardBaseClass,
        "flex h-[102px] flex-col justify-between px-5 py-4"
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] leading-none text-[#282828]">
        <Icon className="h-3 w-3" />
        <span>{item.label}</span>
      </div>
      <div className="text-[34px] leading-none font-semibold tracking-tight text-[#343434]">
        {item.value.toLocaleString()}
      </div>
    </div>
  );
};

const DashboardMetricSkeleton = () => (
  <div className={cn(cardBaseClass, "h-[102px] px-5 py-4")}>
    <Skeleton className="h-3 w-24 rounded-full" />
    <Skeleton className="mt-7 h-8 w-16 rounded-md" />
  </div>
);

const SectionTitle = ({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon: ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#202020]">
    <Icon className="h-3.5 w-3.5" />
    <span>{children}</span>
  </div>
);

const YearLevelDonut = ({ data, total }: YearLevelDonutProps) => {
  const hasData = data.some((item) => item.value > 0);

  const renderYearTooltip = ({ active, payload }: YearLevelTooltipProps) => {
    const item = payload?.[0]?.payload;

    if (!active || !item) return null;

    return (
      <div className="rounded-[10px] border border-[#dedede] bg-white px-3 py-2 text-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-medium text-[#262626]">{item.label}</span>
        </div>
        <div className="mt-1 text-[#189cda]">
          {Number(item.value).toLocaleString()} students
        </div>
      </div>
    );
  };

  return (
    <div className={cn(cardBaseClass, "min-h-[238px] p-5")}>
      <SectionTitle icon={Users}>Students by Year Level</SectionTitle>
      <div className="mt-5 grid grid-cols-[128px_minmax(0,1fr)] items-center gap-2">
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.key}
              className="flex w-fit items-center gap-2 rounded-full bg-[#f1f1f1] px-2 py-1 text-[10px] text-[#303030]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="relative mx-auto h-[180px] w-[180px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={84}
                  paddingAngle={3}
                  cornerRadius={6}
                  nameKey="label"
                  stroke="#ffffff"
                  strokeWidth={5}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  content={renderYearTooltip}
                  wrapperStyle={{ zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-full bg-[#f4f4f4] text-[11px] text-[#777]">
              No data
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#4d4d4d]">Total Students</span>
            <span className="text-[29px] leading-none font-semibold text-[#189cda]">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseBubbleChart = ({ data }: CourseBubbleChartProps) => {
  const bsit = data.find((item) => item.label === "BSIT");
  const bscs = data.find((item) => item.label === "BSCS");

  return (
    <div className={cn(cardBaseClass, "min-h-[238px] p-5")}>
      <SectionTitle icon={BookOpen}>Students by Course</SectionTitle>
      <div className="relative mx-auto mt-6 h-[172px] max-w-[270px]">
        <div className="absolute top-2 left-[44px] flex h-[128px] w-[128px] items-center justify-center rounded-full bg-[#0b4a63] text-[15px] font-semibold text-white">
          {bsit?.percentage.toFixed(1) ?? "0.0"}%
        </div>
        <div className="absolute top-[68px] right-[34px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#178fca] text-[12px] font-semibold text-white ring-4 ring-white">
          {bscs?.percentage.toFixed(1) ?? "0.0"}%
        </div>
      </div>
      <div className="flex justify-center gap-3">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1 rounded-full bg-[#f1f1f1] px-2 py-1 text-[10px] text-[#3a3a3a]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RevenueLineChart = ({
  data,
  selectedDate,
  onSelectedDateChange,
}: RevenueLineChartProps) => {
  const first = data[0];
  const last = data[data.length - 1];
  const currentRange = first && last ? `${first.label} - ${last.label}` : "";
  const previousRange =
    first && last ? `${first.previousLabel} - ${last.previousLabel}` : "";

  const renderRevenueTooltip = ({ active, payload }: RevenueTooltipProps) => {
    if (!active || !payload?.length) return null;

    const datum = payload[0]?.payload;
    if (!datum) return null;

    const currentValue =
      payload.find((item) => item.dataKey === "current")?.value ?? 0;
    const previousValue =
      payload.find((item) => item.dataKey === "previous")?.value ?? 0;

    return (
      <div className="rounded-[10px] border border-[#dedede] bg-white px-3 py-2 text-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
        <div className="font-medium text-[#262626]">{datum.label}</div>
        <div className="mt-2 text-[#1c9dde]">
          {datum.label}: ₱{Number(currentValue).toLocaleString()}
        </div>
        <div className="mt-1 text-[#a5a5a5]">
          {datum.previousLabel}: ₱{Number(previousValue).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(cardBaseClass, "min-h-[312px] p-5")}>
      <div className="flex items-start justify-between gap-3">
        <SectionTitle icon={CircleDollarSign}>Daily Revenue</SectionTitle>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8f8f8f]" />
            <Input
              aria-label="Revenue end date"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                  onSelectedDateChange(event.target.value);
                }
              }}
              className="h-8 w-[150px] rounded-full border-[#e6e6e6] bg-white pl-8 text-[10px] shadow-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#f1f1f1] px-3 py-1 text-[10px] text-[#4a4a4a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#cfcfcf]" />
            {previousRange}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#e9f5fc] px-3 py-1 text-[10px] text-[#4a4a4a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c9dde]" />
            {currentRange}
          </div>
        </div>
      </div>
      <div className="mt-3 h-[238px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#eeeeee" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#7b7b7b" }}
            dy={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#7b7b7b" }}
            tickFormatter={(value: number) =>
              value === 0 ? "0" : `₱${value / 1000}k`
            }
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "#d6d6d6", strokeDasharray: "4 4" }}
            content={renderRevenueTooltip}
          />
          <Line
            type="monotone"
            dataKey="previous"
            stroke="#c9c9c9"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#1c9dde"
            strokeWidth={1.5}
            dot={{ r: 3, fill: "#1c9dde", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#1c9dde" }}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PendingOrdersTable = ({
  data,
  isLoading,
  page,
  search,
  sort,
  total,
  totalPages,
  onPageChange,
  onSearchChange,
  onSortChange,
}: PendingOrdersTableProps) => {
  const [localSearch, setLocalSearch] = useState(search);
  const activeSort = sort[0];
  const visiblePages = buildVisiblePages(page, Math.max(totalPages, 1));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange(localSearch);
      onPageChange(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [localSearch, onPageChange, onSearchChange]);

  const toggleSort = (field: PendingOrderSortField) => {
    const direction =
      activeSort?.field === field && activeSort.direction === "asc"
        ? "desc"
        : "asc";

    onSortChange([{ field, direction }]);
    onPageChange(1);
  };

  const renderSortIcon = (field: PendingOrderSortField) => (
    <ChevronDown
      className={cn(
        "h-3 w-3 text-[#8b8b8b] transition-transform",
        activeSort?.field === field &&
          activeSort.direction === "asc" &&
          "rotate-180"
      )}
    />
  );

  return (
    <div className={cn(cardBaseClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={ClipboardList}>Pending Orders</SectionTitle>
        <div className="relative w-full max-w-[190px]">
          <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-[#9f9f9f]" />
          <Input
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Search"
            className="h-8 rounded-full border-[#e6e6e6] bg-white pl-8 text-[11px] shadow-none"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg">
        <table className="w-full table-fixed text-[11px] text-[#252525]">
          <thead>
            <tr className="bg-[#f1f1f1]">
              <th className="px-2 py-2 text-left font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("product_name")}
                  className="flex items-center gap-1"
                >
                  Product Name {renderSortIcon("product_name")}
                </button>
              </th>
              <th className="px-2 py-2 text-center font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("total")}
                  className="mx-auto flex items-center gap-1"
                >
                  Quantity {renderSortIcon("total")}
                </button>
              </th>
              {(["year_1", "year_2", "year_3", "year_4"] as const).map(
                (field, index) => (
                  <th key={field} className="px-2 py-2 text-center font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(field)}
                      className="mx-auto flex items-center gap-1"
                    >
                      {index + 1}
                      {index === 0
                        ? "st"
                        : index === 1
                          ? "nd"
                          : index === 2
                            ? "rd"
                            : "th"}{" "}
                      Year {renderSortIcon(field)}
                    </button>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index} className="border-b border-[#eeeeee]">
                  <td className="px-2 py-2">
                    <Skeleton className="h-3 w-24 rounded-full" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="mx-auto h-3 w-8 rounded-full" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="mx-auto h-3 w-8 rounded-full" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="mx-auto h-3 w-8 rounded-full" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="mx-auto h-3 w-8 rounded-full" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="mx-auto h-3 w-8 rounded-full" />
                  </td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((order, rowIndex) => (
                <tr
                  key={`${order.product_name}-${rowIndex}`}
                  className="border-b border-[#eeeeee]"
                >
                  <td className="truncate px-2 py-2">
                    {formatProductName(order.product_name)}
                  </td>
                  <td className="px-2 py-2 text-center">{order.total}</td>
                  {[0, 1, 2, 3].map((index) => (
                    <td key={index} className="px-2 py-2 text-center">
                      {order.yearCounts[index] ?? 0}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-2 py-10 text-center text-[#777]">
                  No pending orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[10px] text-[#8a8a8a] sm:flex-row">
        <span>
          Showing {data.length > 0 ? (page - 1) * 10 + 1 : 0} to{" "}
          {Math.min(page * 10, total)} of {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2 py-1 disabled:text-[#c9c9c9]"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="h-3 w-3" />
            Previous
          </button>
          {visiblePages.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              className={cn(
                "h-6 min-w-6 rounded-full px-2",
                item === page
                  ? "bg-[#1c9dde] text-white"
                  : "bg-white text-[#696969]"
              )}
            >
              {item}
            </button>
          ))}
          {totalPages > 4 && page < totalPages - 1 && (
            <>
              <span className="px-1">...</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="h-6 min-w-6 rounded-full bg-white px-2 text-[#696969]"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2 py-1 disabled:text-[#c9c9c9]"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DashboardView = () => {
  const {
    counts,
    courses,
    error,
    isLoading,
    isPendingLoading,
    pendingOrders,
    pendingPage,
    pendingSearch,
    pendingSort,
    pendingTotal,
    pendingTotalPages,
    revenueEndDate,
    revenueTrend,
    setRevenueEndDate,
    setPendingPage,
    setPendingSearch,
    setPendingSort,
    totalStudentsByYear,
    yearLevels,
  } = useDashboardData();

  const displayedStudentTotal = totalStudentsByYear || counts.students;

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#1d1d1d]">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Quick overview
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <DashboardMetricSkeleton key={index} />
              ))
            : metricCards(counts).map((item) => (
                <DashboardMetricCard key={item.label} item={item} />
              ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.38fr_1fr]">
          {isLoading ? (
            <>
              <Skeleton className="h-[238px] rounded-2xl" />
              <Skeleton className="h-[238px] rounded-2xl" />
            </>
          ) : (
            <>
              <YearLevelDonut data={yearLevels} total={displayedStudentTotal} />
              <CourseBubbleChart data={courses} />
            </>
          )}
        </section>

        <section className="mt-6">
          <RevenueLineChart
            data={revenueTrend}
            selectedDate={revenueEndDate}
            onSelectedDateChange={setRevenueEndDate}
          />
        </section>

        <section className="mt-6">
          <PendingOrdersTable
            data={pendingOrders}
            isLoading={isPendingLoading}
            page={pendingPage}
            search={pendingSearch}
            sort={pendingSort}
            total={pendingTotal}
            totalPages={pendingTotalPages}
            onPageChange={setPendingPage}
            onSearchChange={setPendingSearch}
            onSortChange={setPendingSort}
          />
        </section>
      </div>
    </div>
  );
};
