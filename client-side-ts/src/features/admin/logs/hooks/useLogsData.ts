import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchAdminLogs } from "../../api/admin";
import type { AdminLog } from "../types/logs.types";

export const PAGE_SIZE = 10;

const getAdminName = (log: AdminLog): string => {
  return log.admin || "Unknown";
};

const formatTimestamp = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
};

export const useLogsData = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAdminLogs();
      setLogs(Array.isArray(result) ? result : (result?.data ?? []));
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Unable to load logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = logs.filter((log) => {
      const adminName = getAdminName(log).toLowerCase();

      const matchesSearch =
        !query ||
        adminName.includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.target?.toLowerCase().includes(query) ||
        log.target_model?.toLowerCase().includes(query);

      const matchesAction = !actionFilter || log.action === actionFilter;

      const logDate = new Date(log.timestamp);

      const matchesFrom = !fromDate || logDate >= new Date(fromDate);

      const matchesTo = !toDate || logDate <= new Date(`${toDate}T23:59:59`);

      return matchesSearch && matchesAction && matchesFrom && matchesTo;
    });

    const sorted = [...result].sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    );

    return sorted;
  }, [logs, search, actionFilter, fromDate, toDate]);

  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  const toggleLogSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const togglePageSelection = () => {
    const pageIds = pagedLogs.map((log) => log._id);

    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])]
    );
  };

  return {
    error,
    getAdminName,
    formatTimestamp,
    isLoading,

    logs,

    page,
    pagedLogs,

    refresh: loadLogs,

    search,
    setSearch,

    actionFilter,
    setActionFilter,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    selectedIds,

    setPage,

    toggleLogSelection,
    togglePageSelection,

    total,
    totalPages,
    pageSize: PAGE_SIZE,
  };
};
