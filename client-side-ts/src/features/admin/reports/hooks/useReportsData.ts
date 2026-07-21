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
  MerchandiseReportOrder,
  MerchandiseSalesSummary,
  ReportsFilters,
  ReportsStatus,
  ReportsTab,
} from "../types/reports.types";

export const ROWS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 250;
const EMPTY_MEMBERSHIP_ROWS: MembershipReportRow[] = [];
const EMPTY_MERCHANDISE_DETAILS: MerchandiseOrderDetail[] = [];

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
    if (typeof value === "object" && "$each" in (value as Record<string, unknown>)) {
      return flattenVariantField((value as { $each: unknown }).$each);
    }
    return [];
  };

export const useReportsData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportsTab>("membership");

  const [membershipData, setMembershipData] = useState<MembershipReportRow[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<ReportsStatus>("idle");

  const [merchandiseOrders, setMerchandiseOrders] = useState<MerchandiseReportOrder[]>(
    []
  );
  const [merchandiseDetails, setMerchandiseDetails] = useState<
    MerchandiseOrderDetail[]
  >([]);
  const [merchandiseStatus, setMerchandiseStatus] = useState<ReportsStatus>("idle");

  const [filters, setFilters] = useState<ReportsFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
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
    (user?.access === PSITS_ROLES.ADMIN || user?.access === PSITS_ROLES.FINANCE);

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

  const fetchMerchandise = useCallback(async () => {
    const requestId = ++merchandiseRequestRef.current;
    setMerchandiseStatus("loading");
    try {
      const result = await merchandiseReports();
      if (requestId !== merchandiseRequestRef.current) return;
      if (!result) throw new Error("No merchandise reports returned");
      const orders = result.map((order) => ({
        _id: order._id,
        order_details: order.order_details.map((detail) => ({
          ...detail,
          size: flattenVariantField(detail.size),
          variation: flattenVariantField(detail.variation),
        })),
      }));
      setMerchandiseOrders(orders);
      const details = orders.flatMap((order) => order.order_details || []);
      setMerchandiseDetails(details.filter(Boolean));
      setMerchandiseStatus("success");
    } catch {
      if (requestId !== merchandiseRequestRef.current) return;
      setMerchandiseOrders([]);
      setMerchandiseDetails([]);
      setMerchandiseStatus("error");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "membership" && membershipStatus === "idle") {
      fetchMembership();
    }
    if (activeTab === "merchandise" && merchandiseStatus === "idle") {
      fetchMerchandise();
    }
  }, [activeTab, membershipStatus, merchandiseStatus, fetchMembership, fetchMerchandise]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, filters, search]);

  const uniqueProductNames = useMemo(
    () =>
      Array.from(
        new Set(merchandiseDetails.map((detail) => detail.product_name).filter(Boolean))
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
    if (activeTab !== "membership") return EMPTY_MEMBERSHIP_ROWS;
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
      if (filters.name && !row.name?.toLowerCase().includes(filters.name.toLowerCase()))
        return false;
      if (filters.rfid && !row.rfid?.includes(filters.rfid)) return false;
      if (
        filters.course &&
        !row.course?.toLowerCase().includes(filters.course.toLowerCase())
      )
        return false;
      if (filters.year && String(row.year) !== filters.year) return false;
      if (filters.type && row.type !== filters.type) return false;
      if (filters.dateFrom && toDateKey(row.date) < filters.dateFrom) return false;
      if (filters.dateTo && toDateKey(row.date) > filters.dateTo) return false;
      return true;
    });
  }, [activeTab, membershipData, filters, debouncedSearch]);

  const filteredMerchandise = useMemo(() => {
  if (activeTab !== "merchandise") return EMPTY_MERCHANDISE_DETAILS;
  const query = search.trim().toLowerCase();

    return merchandiseDetails.filter((detail) => {
      if (
        query &&
        !`${detail.student_name} ${detail.id_number} ${detail.product_name}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (filters.id && !detail.id_number?.includes(filters.id)) 
        return false;
      if (
        filters.name &&
        !detail.student_name?.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (filters.rfid && !detail.rfid?.includes(filters.rfid)) 
        return false;
      if (
        filters.course &&
        !detail.course?.toLowerCase().includes(filters.course.toLowerCase())
      )
        return false;
      if (filters.year && String(detail.year) !== filters.year) 
        return false;
      if (filters.productName && detail.product_name !== filters.productName)
        return false;
      if (filters.batch && detail.batch !== filters.batch) 
        return false;
      if (filters.size && !detail.size.includes(filters.size)) 
        return false;
      if (filters.color && !detail.variation.includes(filters.color))
        return false;
      if (filters.dateFrom && toDateKey(detail.transaction_date) < filters.dateFrom)
        return false;
      if (filters.dateTo && toDateKey(detail.transaction_date) > filters.dateTo)
        return false;
      return true;
    });
  }, [activeTab, merchandiseDetails, filters, search]);

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
    filteredMerchandise.forEach((detail) => {
      const current = map.get(detail.product_name) || {
        unitsSold: 0,
        totalRevenue: 0,
      };
      current.unitsSold += detail.quantity || 0;
      current.totalRevenue += detail.total || 0;
      map.set(detail.product_name, current);
    });
    return map;
  }, [filteredMerchandise]);

  const activeRowCount =
    activeTab === "membership" ? filteredMembership.length : filteredMerchandise.length;
  const totalPages = Math.max(1, Math.ceil(activeRowCount / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const pagedMembership = useMemo(
    () =>
      filteredMembership.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredMembership, currentPage]
  );

  const pagedMerchandise = useMemo(
    () =>
      filteredMerchandise.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredMerchandise, currentPage]
  );

  const deleteMerchandiseReportItem = async (
    detail: MerchandiseOrderDetail
  ): Promise<boolean> => {
    if (!canDeleteReports) {
      showToast("error", "Unauthorized.");
      return false;
    }

    const parentOrder = merchandiseOrders.find((order) =>
      order.order_details.some((item) => item._id === detail._id)
    );

    if (!parentOrder) {
      showToast("error", "Unable to locate the parent order for this item.");
      return false;
    }

    setIsMutating(true);
    try {
      const success = await deleteReports(
        parentOrder._id,
        detail._id,
        detail.product_name
      );
      if (success) await fetchMerchandise();
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
    filteredMerchandise.map((detail) => ({
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
    totalMerchandiseRows: filteredMerchandise.length,
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
    refetchMerchandise: fetchMerchandise,
  };
};