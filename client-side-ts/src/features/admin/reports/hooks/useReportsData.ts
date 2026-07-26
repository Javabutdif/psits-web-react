import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ReportsFilters,
  ReportsStatus,
  ReportsTab,
} from "../types/reports.types";

export const ROWS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 250;
const EMPTY_MEMBERSHIP_ROWS: MembershipReportRow[] = [];

export const DEFAULT_FILTERS: ReportsFilters = {
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

const flattenVariantField = (value: unknown): string[] => {
  if (value == null) return [];
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(flattenVariantField);
  if (
    typeof value === "object" &&
    "$each" in (value as Record<string, unknown>)
  ) {
    return flattenVariantField((value as { $each: unknown }).$each);
  }
  return [];
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
  const [merchandiseProductNames, setMerchandiseProductNames] = useState<
    string[]
  >([]);
  const [merchandiseSummary, setMerchandiseSummary] = useState({
    unitsSold: 0,
    totalRevenue: 0,
  });
  const [merchandiseStatus, setMerchandiseStatus] =
    useState<ReportsStatus>("idle");

  const [filters, setFilters] = useState<ReportsFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search]);

  const [page, setPage] = useState(1);
  const [isMutating, setIsMutating] = useState(false);
  const membershipRequestRef = useRef(0);
  const merchandiseRequestRef = useRef(0);

  const isUcMainAdmin =
    user?.role === "admin" && normalizeCampus(user.campus) === "UC-MAIN";

  const canDeleteReports =
    isUcMainAdmin &&
    (user?.access === PSITS_ROLES.ADMIN ||
      user?.access === PSITS_ROLES.FINANCE);

  const fetchMembership = useCallback(async () => {
    const requestId = ++membershipRequestRef.current;
    setMembershipStatus("loading");
    try {
      const result = await membershipHistory();
      if (requestId !== membershipRequestRef.current) return;
      if (!result) throw new Error("No membership history returned");
      setMembershipData(result);
      setMembershipStatus("success");
    } catch {
      if (requestId !== membershipRequestRef.current) return;
      setMembershipData([]);
      setMembershipStatus("error");
    }
  }, []);

  const fetchMerchandise = useCallback(
    async (requestedPage: number) => {
      const requestId = ++merchandiseRequestRef.current;
      setMerchandiseStatus("loading");
      try {
        const result = await merchandiseReports({
          page: requestedPage,
          limit: ROWS_PER_PAGE,
          search: debouncedSearch,
          studentId: filters.id,
          name: filters.name,
          course: filters.course,
          year: filters.year,
          productName: filters.productName,
          size: filters.size,
          color: filters.color,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        

        if (requestId !== merchandiseRequestRef.current) return;
        if (!result) throw new Error("No merchandise reports returned");

        const details = result.data.map((detail) => ({
          ...detail,
          size: flattenVariantField(detail.size),
          variation: flattenVariantField(detail.variation),
        }));

        setMerchandiseDetails(details.filter(Boolean));
        setMerchandiseTotal(result.total);
        setMerchandiseTotalPages(result.totalPages);
        setMerchandiseProductNames(result.productNames ?? []);
        setMerchandiseSummary(
          result.summary ?? { unitsSold: 0, totalRevenue: 0 }
        );
        setMerchandiseStatus("success");
      } catch {
        if (requestId !== merchandiseRequestRef.current) return;
        setMerchandiseDetails([]);
        setMerchandiseTotal(0);
        setMerchandiseTotalPages(1);
        setMerchandiseProductNames([]);
        setMerchandiseSummary({ unitsSold: 0, totalRevenue: 0 });
        setMerchandiseStatus("error");
      }
    },
    [debouncedSearch, filters]
  );

  useEffect(() => {
    if (activeTab === "membership" && membershipStatus === "idle") {
      fetchMembership();
    }
    if (activeTab === "merchandise") {
      fetchMerchandise(page);
    }
  }, [
    activeTab,
    page,
    membershipStatus,
    debouncedSearch,
    filters,
    fetchMembership,
    fetchMerchandise,
  ]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, filters, search]);

  const uniqueProductNames = merchandiseProductNames;

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
    if (activeTab !== "membership") return EMPTY_MEMBERSHIP_ROWS;
    const query = debouncedSearch.trim().toLowerCase();
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
  }, [activeTab, membershipData, filters, debouncedSearch]);

  const membershipSummary = useMemo(() => {
    const totalMembers = filteredMembership.length;
    const totalRevenue = filteredMembership.reduce(
      (sum, row) => sum + (row.total || 0),
      0
    );
    return { totalMembers, totalRevenue };
  }, [filteredMembership]);

  const activeRowCount =
    activeTab === "membership" ? filteredMembership.length : merchandiseTotal;
  const totalPages =
    activeTab === "membership"
      ? Math.max(1, Math.ceil(activeRowCount / ROWS_PER_PAGE))
      : merchandiseTotalPages;
  const currentPage = Math.min(page, totalPages);

  const pagedMembership = useMemo(
    () =>
      filteredMembership.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredMembership, currentPage]
  );

  const pagedMerchandise = merchandiseDetails;

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
      Size: detail.size.join(", "),
      Variation: detail.variation.join(", "),
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
    page: currentPage,
    setPage,
    totalPages,
    pagedMembership,
    pagedMerchandise,
    totalMembershipRows: filteredMembership.length,
    totalMerchandiseRows: merchandiseTotal,
    membershipSummary,
    merchandiseSummary,
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
