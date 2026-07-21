import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteReports,
  membershipHistory,
  merchandiseReports,
} from "@/features/admin/api/admin";
import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";
import { PSITS_ROLES } from "../../constants/adminAccess";
import type {
  MembershipReportRow,
  MerchandiseOrderDetail,
  MerchandiseSalesSummary,
  ReportsFilters,
  ReportsStatus,
  ReportsTab,
} from "../types/reports.types";

export const ROWS_PER_PAGE = 10;

const DEFAULT_FILTERS: ReportsFilters = {
  id: "",
  name: "",
  rfid: "",
  course: "",
  year: "",
  type: "",
  productName: "",
  batch: "",
  size: "",
  color: "",
  dateFrom: "",
  dateTo: "",
};

const toDateKey = (value: string | Date | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value) return [value];
  return [];
};

type MerchandiseReportsResult = {
  data: MerchandiseOrderDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const useReportsData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportsTab>("membership");

  const [membershipData, setMembershipData] = useState<MembershipReportRow[]>(
    []
  );
  const [membershipStatus, setMembershipStatus] =
    useState<ReportsStatus>("idle");

  const [merchandiseDetails, setMerchandiseDetails] = useState<
    MerchandiseOrderDetail[]
  >([]);
  const [merchandiseTotal, setMerchandiseTotal] = useState(0);
  const [merchandiseTotalPages, setMerchandiseTotalPages] = useState(1);
  const [merchandiseStatus, setMerchandiseStatus] =
    useState<ReportsStatus>("idle");

  const [filters, setFilters] = useState<ReportsFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isMutating, setIsMutating] = useState(false);

  const isUcMainAdmin =
    user?.role === "admin" && normalizeCampus(user.campus) === "UC-MAIN";
  // Mirrors the legacy `financeAndAdminConditionalAccess()` check, and
  // matches the backend's own gate on DELETE /api/merch/delete-report
  // (adminAccessAuthenticateV2(["admin", "finance"])).
  const canDeleteReports =
    isUcMainAdmin &&
    (user?.access === PSITS_ROLES.ADMIN ||
      user?.access === PSITS_ROLES.FINANCE);

  const fetchMembership = useCallback(async () => {
    setMembershipStatus("loading");
    try {
      const result = await membershipHistory();
      if (!result) throw new Error("No membership history returned");
      setMembershipData(result as unknown as MembershipReportRow[]);
      setMembershipStatus("success");
    } catch {
      setMembershipData([]);
      setMembershipStatus("error");
    }
  }, []);

  const fetchMerchandise = useCallback(async (targetPage = 1) => {
    setMerchandiseStatus("loading");
    try {
      const result = (await merchandiseReports({
        page: targetPage,
        limit: ROWS_PER_PAGE,
      })) as MerchandiseReportsResult | void;
      if (!result) throw new Error("No merchandise reports returned");
      setMerchandiseDetails((result.data || []).filter(Boolean));
      setMerchandiseTotal(result.total || 0);
      setMerchandiseTotalPages(result.totalPages || 1);
      setMerchandiseStatus("success");
    } catch {
      setMerchandiseDetails([]);
      setMerchandiseTotal(0);
      setMerchandiseTotalPages(1);
      setMerchandiseStatus("error");
    }
  }, []);

  // Fetch once per tab, lazily. Failure lands in an explicit "error"
  // state rather than looping or silently showing an empty table —
  // this is the fix for the "Fetching Reports..." infinite-spinner bug
  // in the legacy component.
  useEffect(() => {
    if (activeTab === "membership" && membershipStatus === "idle") {
      fetchMembership();
    }
    if (activeTab === "merchandise") {
      fetchMerchandise(page);
    }
  }, [activeTab, page, membershipStatus, fetchMembership, fetchMerchandise]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, filters, search]);

  const uniqueProductNames = useMemo(
    () =>
      Array.from(
        new Set(
          merchandiseDetails
            .map((detail) => detail.product_name)
            .filter(Boolean)
        )
      ),
    [merchandiseDetails]
  );

  const getBatchesForProduct = useCallback(
    (productName: string): string[] => {
      if (!productName) return [];
      return Array.from(
        new Set(
          merchandiseDetails
            .filter((detail) => detail.product_name === productName)
            .map((detail) => detail.batch)
            .filter((batch): batch is string => Boolean(batch))
        )
      );
    },
    [merchandiseDetails]
  );

  const filteredMembership = useMemo(() => {
    const query = search.trim().toLowerCase();
    return membershipData.filter((row) => {
      if (
        query &&
        !`${row.name} ${row.id_number} ${row.reference_code}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (filters.id && !row.reference_code?.includes(filters.id)) return false;
      if (
        filters.name &&
        !row.name?.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (filters.rfid && !row.rfid?.includes(filters.rfid)) return false;
      if (
        filters.course &&
        !row.course?.toLowerCase().includes(filters.course.toLowerCase())
      )
        return false;
      if (filters.year && String(row.year) !== filters.year) return false;
      if (filters.type && row.type !== filters.type) return false;
      if (filters.dateFrom && toDateKey(row.date) < filters.dateFrom)
        return false;
      if (filters.dateTo && toDateKey(row.date) > filters.dateTo) return false;
      return true;
    });
  }, [membershipData, filters, search]);

  const membershipSummary = useMemo(() => {
    const totalMembers = filteredMembership.length;
    const totalRevenue = filteredMembership.reduce(
      (sum, row) => sum + (row.total || 0),
      0
    );
    return { totalMembers, totalRevenue };
  }, [filteredMembership]);

  const merchandiseSalesSummary = useMemo(() => {
    const map = new Map<string, MerchandiseSalesSummary>();
    merchandiseDetails.forEach((detail) => {
      const current = map.get(detail.product_name) || {
        unitsSold: 0,
        totalRevenue: 0,
      };
      current.unitsSold += detail.quantity || 0;
      current.totalRevenue += detail.total || 0;
      map.set(detail.product_name, current);
    });
    return map;
  }, [merchandiseDetails]);

  const activeRowCount =
    activeTab === "membership" ? filteredMembership.length : merchandiseTotal;
  const totalPages =
    activeTab === "membership"
      ? Math.max(1, Math.ceil(activeRowCount / ROWS_PER_PAGE))
      : merchandiseTotalPages;
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const pagedMembership = useMemo(
    () =>
      filteredMembership.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredMembership, currentPage]
  );

  const pagedMerchandise = useMemo(
    () => merchandiseDetails,
    [merchandiseDetails]
  );

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const deleteMerchandiseReportItem = async (
    detail: MerchandiseOrderDetail
  ): Promise<boolean> => {
    if (!canDeleteReports) {
      showToast("error", "Unauthorized.");
      return false;
    }

    setIsMutating(true);
    try {
      const success = await deleteReports(
        detail.product_id,
        detail._id,
        detail.product_name
      );
      if (success) await fetchMerchandise(page);
      return success;
    } finally {
      setIsMutating(false);
    }
  };

  const buildMembershipExportRows = () =>
    filteredMembership.map((row) => ({
      "Reference Code": row.reference_code,
      "Student ID": row.id_number,
      Name: row.name,
      Course: row.course,
      "Year Level": row.year,
      Type: row.type,
      Date: toDateKey(row.date),
      "Approved By": row.admin || "",
    }));

  const buildMerchandiseExportRows = () =>
    merchandiseDetails.map((detail) => ({
      "Reference Code": detail.reference_code,
      Merchandise: detail.product_name,
      "Student ID": detail.id_number,
      Name: detail.student_name,
      Course: detail.course,
      "Year Level": detail.year,
      Batch: detail.batch || "",
      Size: normalizeStringArray(detail.size).join(", "),
      Variation: normalizeStringArray(detail.variation).join(", "),
      Qty: detail.quantity,
      Total: detail.total,
      "Transaction Date": toDateKey(detail.transaction_date),
    }));

  return {
    activeTab,
    setActiveTab,
    membershipStatus,
    merchandiseStatus,
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    page: currentPage,
    setPage,
    totalPages,
    pagedMembership,
    pagedMerchandise,
    totalMembershipRows: filteredMembership.length,
    totalMerchandiseRows: merchandiseTotal,
    membershipSummary,
    merchandiseSalesSummary,
    uniqueProductNames,
    getBatchesForProduct,
    canDeleteReports,
    isMutating,
    deleteMerchandiseReportItem,
    buildMembershipExportRows,
    buildMerchandiseExportRows,
    refetchMembership: fetchMembership,
    refetchMerchandise: () => fetchMerchandise(page),
  };
};
