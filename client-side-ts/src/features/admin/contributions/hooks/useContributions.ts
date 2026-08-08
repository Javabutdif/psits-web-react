import { useCallback, useEffect, useState } from "react";
import {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
  syncDeveloperContributions,
  getGithubSyncStatus,
  getAdminOptions,
  searchStudents,
} from "../api/contributions.api";
import type {
  Contribution,
  SyncStatus,
  AdminOption,
  StudentOption,
} from "../types/contribution.types";

export const useContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [developerContributions, setDeveloperContributions] = useState<Contribution[]>([]);
  const [mediaContributions, setMediaContributions] = useState<Contribution[]>([]);
  const [volunteerContributions, setVolunteerContributions] = useState<Contribution[]>([]);
  const [adminOptions, setAdminOptions] = useState<AdminOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await getContributions();
      if (all) {
        setContributions(all);
        setDeveloperContributions(all.filter((c) => c.type === "developer"));
        setMediaContributions(all.filter((c) => c.type === "media"));
        setVolunteerContributions(all.filter((c) => c.type === "volunteer"));
      }
    } catch {
      setError("Failed to load contributions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    const status = await getGithubSyncStatus();
    if (status) {
      setSyncStatus(status);
    }
  }, []);

  const fetchAdminOptions = useCallback(async () => {
    const options = await getAdminOptions();
    if (options) {
      setAdminOptions(options);
    }
  }, []);

  const searchStudentOptions = useCallback(
    async (query: string): Promise<StudentOption[]> => {
      const results = await searchStudents(query);
      return results || [];
    },
    []
  );

  useEffect(() => {
    void fetchContributions();
    void fetchSyncStatus();
    void fetchAdminOptions();
  }, [fetchContributions, fetchSyncStatus, fetchAdminOptions]);

  const handleCreate = useCallback(
    async (payload: {
      idNumber: string;
      type: "developer" | "media" | "volunteer";
      description: string;
      date: string;
    }) => {
      const success = await createContribution(payload);
      if (success) {
        void fetchContributions();
      }
      return success;
    },
    [fetchContributions]
  );

  const handleUpdate = useCallback(
    async (id: string, payload: { description?: string; date?: string }) => {
      const success = await updateContribution(id, payload);
      if (success) {
        void fetchContributions();
      }
      return success;
    },
    [fetchContributions]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const success = await deleteContribution(id);
      if (success) {
        void fetchContributions();
      }
      return success;
    },
    [fetchContributions]
  );

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const success = await syncDeveloperContributions();
      if (success) {
        void fetchContributions();
        void fetchSyncStatus();
      }
    } finally {
      setIsSyncing(false);
    }
  }, [fetchContributions, fetchSyncStatus]);

  return {
    contributions,
    developerContributions,
    mediaContributions,
    volunteerContributions,
    adminOptions,
    isLoading,
    isSyncing,
    syncStatus,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSync,
    searchStudentOptions,
    refresh: fetchContributions,
  };
};