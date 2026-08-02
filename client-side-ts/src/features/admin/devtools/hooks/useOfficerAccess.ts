import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";
import { fetchOfficers, updateOfficerAccess } from "@/features/admin/settings/api/settings.api";
import type { Officer } from "@/features/admin/settings/types/settings.types";
import type { PsitsRole } from "@/features/admin/constants/adminAccess";
import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";

const canEditAccess = (currentUserAccess: string | undefined, officerAccess: PsitsRole): boolean => {
  if (currentUserAccess === PSITS_ROLES.ADMIN) return true;
  if (currentUserAccess === PSITS_ROLES.FINANCE && (officerAccess === PSITS_ROLES.NO_ACCESS || officerAccess === PSITS_ROLES.STANDARD)) return true;
  if (currentUserAccess === PSITS_ROLES.EXECUTIVE && (officerAccess === PSITS_ROLES.NO_ACCESS || officerAccess === PSITS_ROLES.STANDARD)) return true;
  return false;
};

export const useOfficerAccess = () => {
  const { user } = useAuth();

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const isUcMainAdmin =
    user?.role === "admin" && normalizeCampus(user.campus) === "UC_MAIN";

  const isAdminAccess = isUcMainAdmin && user?.access === PSITS_ROLES.ADMIN;

  const currentUserAccess = user?.access;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOfficers(roleFilter !== "all" ? roleFilter : undefined)
      .then((data) => {
        if (!cancelled && data) setOfficers(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleFilter]);

  const handleUpdateAccess = useCallback(
    async (idNumber: string, newAccess: PsitsRole) => {
      setUpdating(idNumber);
      try {
        const result = await updateOfficerAccess(idNumber, newAccess);
        if (result === true || (result as unknown as number) === 200) {
          setOfficers((prev) =>
            prev.map((o) =>
              o.id_number === idNumber ? { ...o, access: newAccess } : o
            )
          );
          showToast("success", "Officer access updated successfully.");
        } else {
          showToast(
            "error",
            result === undefined ? "Failed to update access." : String(result)
          );
        }
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  return {
    officers,
    loading,
    isAdminAccess,
    isUcMainAdmin,
    currentUserAccess,
    roleFilter,
    setRoleFilter,
    updating,
    canEditAccess,
    handleUpdateAccess,
  };
};
