import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAllPendingCounts,
  getCountActiveMemberships,
  getCountStudent,
  getDashboardActiveStudents,
  getDashboardPaidOrders,
  merchCreated,
  placedOrders,
} from "@/features/admin/api/admin";
import type {
  CourseDatum,
  DashboardCounts,
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

const formatCoursePercentage = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

const normalizeYear = (year?: string | number) => {
  const yearValue = String(year ?? "").trim().toLowerCase();

  if (yearValue === "1" || yearValue.includes("1st")) return "year1";
  if (yearValue === "2" || yearValue.includes("2nd")) return "year2";
  if (yearValue === "3" || yearValue.includes("3rd")) return "year3";
  if (yearValue === "4" || yearValue.includes("4th")) return "year4";

  return null;
};

const buildStudentStatsFromActiveStudents = (
  students: Array<{ course?: string; year?: string | number }>
) => {
  const stats = {
    courses: {
      BSIT: 0,
      BSCS: 0,
      ACT: 0,
    },
    years: {
      year1: 0,
      year2: 0,
      year3: 0,
      year4: 0,
    },
  };

  students.forEach((student) => {
    const course = student.course?.trim().toUpperCase();
    const year = normalizeYear(student.year);

    if (course === "BSIT" || course === "BSCS" || course === "ACT") {
      stats.courses[course] += 1;
    }

    if (year) {
      stats.years[year] += 1;
    }
  });

  return stats;
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
      const [
        studentCount,
        merchandiseCount,
        orderCount,
        activeMembershipCount,
        activeStudents,
        paidOrders,
      ] = await Promise.all([
        getCountStudent(),
        merchCreated(),
        placedOrders(),
        getCountActiveMemberships(),
        getDashboardActiveStudents(),
        fetchPaidOrdersForRevenue(),
      ]);

      const nextCounts: DashboardCounts = {
        onSaleProducts:
          typeof merchandiseCount === "number" ? merchandiseCount : 0,
        students: studentCount ? studentCount.all : 0,
        orders: typeof orderCount === "number" ? orderCount : 0,
        activeMembers:
          typeof activeMembershipCount === "number"
            ? activeMembershipCount
            : 0,
      };

      const studentStats = buildStudentStatsFromActiveStudents(activeStudents);
      const years = studentStats.years;
      const yearData: YearLevelDatum[] = [
        {
          key: "year1",
          label: "1st Year",
          shortLabel: "1st",
          value: years?.year1 ?? 0,
          color: YEAR_COLORS[0],
        },
        {
          key: "year2",
          label: "2nd Year",
          shortLabel: "2nd",
          value: years?.year2 ?? 0,
          color: YEAR_COLORS[1],
        },
        {
          key: "year3",
          label: "3rd Year",
          shortLabel: "3rd",
          value: years?.year3 ?? 0,
          color: YEAR_COLORS[2],
        },
        {
          key: "year4",
          label: "4th Year",
          shortLabel: "4th",
          value: years?.year4 ?? 0,
          color: YEAR_COLORS[3],
        },
      ];

      const courseStats = studentStats?.courses;
      const courseTotal =
        (courseStats?.BSIT ?? 0) +
        (courseStats?.BSCS ?? 0) +
        (courseStats?.ACT ?? 0);
      const courseData: CourseDatum[] = [
        {
          label: "BSIT",
          value: courseStats?.BSIT ?? 0,
          percentage: formatCoursePercentage(courseStats?.BSIT ?? 0, courseTotal),
          color: "#0B4A63",
        },
        {
          label: "BSCS",
          value: courseStats?.BSCS ?? 0,
          percentage: formatCoursePercentage(courseStats?.BSCS ?? 0, courseTotal),
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
