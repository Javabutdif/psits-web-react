import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMemberships,
  updateMembership,
  revokeMembership,
  activateMembership,
  getMembershipHistories,
  createMembership,
} from "../api/membership.api";
import type {
  Membership,
  MembershipSort,
  MembershipStatus,
  CreateMembershipFormData,
  UpdateMembershipFormData,
  HistoryRecord,
} from "../types/membership.types";

const ROWS_PER_PAGE = 10;

const DEFAULT_SORT: MembershipSort = {
  field: "startDate",
  direction: "desc",
};

const normalizeMembership = (record: any): Membership => {
  return {
    _id: record._id,
    membership_name: record.membership_name || "",
    start_date: record.start_date || "",
    end_date: record.end_date || "",
    term_name: record.term_name || "",
    is_active: record.is_active ?? false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const useMembershipData = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MembershipStatus>("ALL");
  const [termFilter, setTermFilter] = useState("ALL");
  const [sort, setSort] = useState<MembershipSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState<CreateMembershipFormData>({
    membership_name: "",
    start_date: "",
    end_date: "",
    term_name: "MEMBERSHIP_TERM_FIRST",
  });
  const [editFormData, setEditFormData] = useState<UpdateMembershipFormData>({
    membership_name: "",
    start_date: "",
    end_date: "",
    term_name: "MEMBERSHIP_TERM_FIRST",
  });

  // Report date-range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Activation history list for a membership term
  const [histories, setHistories] = useState<HistoryRecord[]>([]);
  const [isHistoriesOpen, setIsHistoriesOpen] = useState(false);
  const [isHistoriesLoading, setIsHistoriesLoading] = useState(false);

  const fetchMemberships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMemberships();
      setMemberships((result || []).map(normalizeMembership));
    } catch {
      setMemberships([]);
      setError("Unable to load membership data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const filteredMemberships = useMemo(() => {
    const query = search.trim().toLowerCase();

    return memberships
      .filter((m) => {
        if (query && !m.membership_name.toLowerCase().includes(query)) return false;

        if (statusFilter === "ACTIVE" && !m.is_active) return false;
        if (statusFilter === "INACTIVE" && m.is_active) return false;

        if (termFilter !== "ALL" && m.term_name !== termFilter) return false;

        // Period overlap: membership avail in [dateFrom, dateTo] when
        // start_date <= dateTo AND end_date >= dateFrom (day granularity)
        if (dateFrom || dateTo) {
          const recordStart = new Date(m.start_date);
          const recordEnd = new Date(m.end_date);
          recordStart.setHours(0, 0, 0, 0);
          recordEnd.setHours(0, 0, 0, 0);
          if (dateTo && recordStart.getTime() > new Date(dateTo).getTime()) return false;
          if (dateFrom && recordEnd.getTime() < new Date(dateFrom).getTime()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let aVal: string;
        let bVal: string;

        switch (sort.field) {
          case "name":
            aVal = a.membership_name.toLowerCase();
            bVal = b.membership_name.toLowerCase();
            break;
          case "startDate":
            aVal = a.start_date;
            bVal = b.start_date;
            break;
          case "endDate":
            aVal = a.end_date;
            bVal = b.end_date;
            break;
          case "status":
            aVal = a.is_active ? "ACTIVE" : "INACTIVE";
            bVal = b.is_active ? "ACTIVE" : "INACTIVE";
            break;
          default:
            aVal = a.start_date;
            bVal = b.start_date;
        }

        const result = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sort.direction === "asc" ? result : -result;
      });
  }, [memberships, search, statusFilter, termFilter, sort, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredMemberships.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedMemberships = filteredMemberships.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const stats = useMemo(() => ({
    total: memberships.length,
    active: memberships.filter((m) => m.is_active).length,
    inactive: memberships.filter((m) => !m.is_active).length,
  }), [memberships]);

  const openCreateDialog = () => {
    setCreateFormData({
      membership_name: "",
      start_date: "",
      end_date: "",
      term_name: "MEMBERSHIP_TERM_FIRST",
    });
    setIsCreateDialogOpen(true);
  };

  const openActivateDialog = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsActivateDialogOpen(true);
  };

  const handleActivate = async () => {
    if (!selectedMembership) return;
    setIsMutating(true);
    try {
      const result = await activateMembership(selectedMembership._id);
      if (result.success) {
        setIsActivateDialogOpen(false);
        await fetchMemberships();
      }
    } finally {
      setIsMutating(false);
    }
  };

  // Open the activation-history list for a membership term
  const openHistories = async (membership: Membership) => {
    setSelectedMembership(membership);
    setIsHistoriesOpen(true);
    setIsHistoriesLoading(true);
    try {
      const result = await getMembershipHistories(membership._id);
      setHistories(Array.isArray(result) ? result : []);
    } catch {
      setHistories([]);
    } finally {
      setIsHistoriesLoading(false);
    }
  };

  const closeHistories = () => {
    setIsHistoriesOpen(false);
    setHistories([]);
  };

  const openEditDialog = (membership: Membership) => {
    setSelectedMembership(membership);
    setEditFormData({
      membership_name: membership.membership_name,
      start_date: membership.start_date,
      end_date: membership.end_date,
      term_name: membership.term_name as any,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    setIsMutating(true);
    try {
      const result = await createMembership(createFormData);
      if (result.success) {
        setIsCreateDialogOpen(false);
        await fetchMemberships();
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMembership) return;
    setIsMutating(true);
    try {
      const result = await updateMembership(selectedMembership._id, editFormData);
      if (result.success) {
        setIsEditDialogOpen(false);
        await fetchMemberships();
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMembership) return;
    setIsMutating(true);
    try {
      const result = await revokeMembership(selectedMembership._id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        await fetchMemberships();
      }
    } finally {
      setIsMutating(false);
    }
  };

  const toggleSort = (field: MembershipSort["field"]) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  return {
    // Data
    memberships: pagedMemberships,
    allMemberships: memberships,
    filteredMemberships,
    currentPage,
    totalPages,
    stats,
    isLoading,
    isMutating,
    error,

    // Filters
    search,
    statusFilter,
    termFilter,
    dateFrom,
    dateTo,
    setSearch,
    setStatusFilter,
    setTermFilter,
    setDateFrom,
    setDateTo,

    // History list
    histories,
    isHistoriesOpen,
    isHistoriesLoading,
    openHistories,
    closeHistories,

    // Sort
    sort,
    toggleSort,

    // Pagination
    page,
    setPage,

    // Dialogs
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isActivateDialogOpen,
    setIsActivateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedMembership,
    openActivateDialog,

    // Forms
    createFormData,
    setCreateFormData,
    editFormData,
    setEditFormData,

    // Actions
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleActivate,
    refresh: fetchMemberships,
  };
};
