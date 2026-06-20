import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAllPendingCounts,
  getDashboardPaidOrders,
  getDashboardStats,
} from "@/features/admin/api/admin";
import type {
  CourseDatum,
  DashboardCounts,
  DashboardStatsResponse,
  PendingOrderCount,
  PendingOrderSortRule,
  RevenueDatum,
  RevenueOrderDatum,
  YearLevelDatum,
} from "../types/dashboard.types";

const YEAR_COLORS = ["#0B4A63", "#1278A5", "#239EDB", "#8FD0EC"] as const;

const initialCounts: DashboardCounts = {
  onSaleProducts: 0,
  students: 0,
  orders: 0,
  activeMembers: 0,
};

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return startOfLocalDay(new Date());
  }

  return startOfLocalDay(new Date(year, month - 1, day));
};

const formatDashboardDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

const buildRevenueTrend = (
  paidOrders: RevenueOrderDatum[],
  endDateKey: string
): RevenueDatum[] => {
  const selectedEndDate = parseDateKey(endDateKey);
  const currentStart = addDays(selectedEndDate, -6);
  const previousStart = addDays(selectedEndDate, -13);

  const revenueByDate = new Map<string, number>();

  paidOrders.forEach((order) => {
    const rawDate = order.transaction_date ?? order.order_date;
    if (!rawDate) return;

    const orderDate = startOfLocalDay(new Date(rawDate));
    if (Number.isNaN(orderDate.getTime())) return;

    const key = formatDateKey(orderDate);
    revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + (order.total ?? 0));
  });

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = addDays(currentStart, index);
    const previousDate = addDays(previousStart, index);

    return {
      label: formatDashboardDate(currentDate),
      previousLabel: formatDashboardDate(previousDate),
      current: revenueByDate.get(formatDateKey(currentDate)) ?? 0,
      previous: revenueByDate.get(formatDateKey(previousDate)) ?? 0,
    };
  });
};

const fetchPaidOrdersForRevenue = async () => {
  const firstPage = await getDashboardPaidOrders({ page: 1, limit: 1000 });

  if (firstPage.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getDashboardPaidOrders({ page: index + 2, limit: 1000 })
    )
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((pageResult) => pageResult.data),
  ];
};

export const useDashboardData = () => {
  const [counts, setCounts] = useState<DashboardCounts>(initialCounts);
  const [yearLevels, setYearLevels] = useState<YearLevelDatum[]>([]);
  const [courses, setCourses] = useState<CourseDatum[]>([]);
  const [revenueOrders, setRevenueOrders] = useState<RevenueOrderDatum[]>([]);
  const [revenueEndDate, setRevenueEndDate] = useState(() =>
    formatDateKey(new Date())
  );
  const [pendingOrders, setPendingOrders] = useState<PendingOrderCount[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingSort, setPendingSort] = useState<PendingOrderSortRule[]>([
    { field: "product_name", direction: "asc" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashboardStats, paidOrders] = await Promise.all([
        getDashboardStats(),
        fetchPaidOrdersForRevenue(),
      ]);

      const stats: DashboardStatsResponse = dashboardStats ?? {
        dashboardCount: {
          courses: { BSIT: 0, BSCS: 0, ACT: 0 },
          years: { year1: 0, year2: 0, year3: 0, year4: 0 },
        },
        studentCount: { all: 0, request: 0, deleted: 0 },
        merchCount: 0,
        pendingCount: 0,
        activeMembershipCount: 0,
        dailySales: [],
      };

      const nextCounts: DashboardCounts = {
        onSaleProducts: stats.merchCount ?? 0,
        students: stats.studentCount?.all ?? 0,
        orders: stats.pendingCount ?? 0,
        activeMembers: stats.activeMembershipCount ?? 0,
      };

      const years = stats.dashboardCount?.years ?? {
        year1: 0,
        year2: 0,
        year3: 0,
        year4: 0,
      };
      const yearData: YearLevelDatum[] = [
        {
          key: "year1",
          label: "1st Year",
          shortLabel: "1st",
          value: years.year1 ?? 0,
          color: YEAR_COLORS[0],
        },
        {
          key: "year2",
          label: "2nd Year",
          shortLabel: "2nd",
          value: years.year2 ?? 0,
          color: YEAR_COLORS[1],
        },
        {
          key: "year3",
          label: "3rd Year",
          shortLabel: "3rd",
          value: years.year3 ?? 0,
          color: YEAR_COLORS[2],
        },
        {
          key: "year4",
          label: "4th Year",
          shortLabel: "4th",
          value: years.year4 ?? 0,
          color: YEAR_COLORS[3],
        },
      ];

      const courseStats = stats.dashboardCount?.courses ?? {
        BSIT: 0,
        BSCS: 0,
        ACT: 0,
      };
      const courseData: CourseDatum[] = [
        {
          label: "BSIT",
          value: courseStats.BSIT ?? 0,
          color: "#0B4A63",
        },
        {
          label: "BSCS",
          value: courseStats.BSCS ?? 0,
          color: "#1689BD",
        },
      ];

      setCounts(nextCounts);
      setYearLevels(yearData);
      setCourses(courseData);
      setRevenueOrders(paidOrders);
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    setIsPendingLoading(true);
    try {
      const sortParam = JSON.stringify(pendingSort);
      const result = await fetchAllPendingCounts({
        page: pendingPage,
        limit: 10,
        search: pendingSearch,
        sort: sortParam,
      });

      setPendingOrders(result.data);
      setPendingTotal(result.total);
      setPendingTotalPages(result.totalPages || 1);
    } catch {
      setPendingOrders([]);
      setPendingTotal(0);
      setPendingTotalPages(1);
    } finally {
      setIsPendingLoading(false);
    }
  }, [pendingPage, pendingSearch, pendingSort]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const totalStudentsByYear = useMemo(
    () => yearLevels.reduce((sum, item) => sum + item.value, 0),
    [yearLevels]
  );

  const revenueTrend = useMemo(
    () => buildRevenueTrend(revenueOrders, revenueEndDate),
    [revenueOrders, revenueEndDate]
  );

  return {
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
    totalStudentsByYear,
    yearLevels,
    setRevenueEndDate,
    setPendingPage,
    setPendingSearch,
    setPendingSort,
    refetch: fetchSummary,
  };
};
