import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";
import {
  fetchOfficers,
  updateOfficerAccess,
  fetchMembershipPrice,
  updateMembershipPrice,
  revokeAllActiveMemberships,
} from "../api/settings.api";
import type { SettingsTab, Officer } from "../types/settings.types";
import type { PsitsRole } from "@/features/admin/constants/adminAccess";

export const useSettingsData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("officer");

  // Officer state
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerLoading, setOfficerLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Membership state
  const [membershipPrice, setMembershipPrice] = useState(0);
  const [priceDraft, setPriceDraft] = useState("");
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [confirmPrice, setConfirmPrice] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  // Account state
  const [confirmChangePassword, setConfirmChangePassword] = useState(false);
  const [confirmEditAccount, setConfirmEditAccount] = useState(false);

  const isUcMainAdmin =
    user?.role === "admin" && normalizeCampus(user.campus) === "UC-MAIN";

  const isAdminAccess =
    isUcMainAdmin && user?.access === "PSITS_ADMIN";

  useEffect(() => {
    const load = async () => {
      setOfficerLoading(true);
      try {
        const data = await fetchOfficers(roleFilter !== "all" ? roleFilter : undefined);
        if (data) setOfficers(data);
      } finally {
        setOfficerLoading(false);
      }

      try {
        const priceResult: unknown = await fetchMembershipPrice();
        if (typeof priceResult === "number") {
          setMembershipPrice(priceResult);
          setPriceDraft(String(priceResult));
        }
      } catch {
        // ignore
      }
    };
    load();
  }, [roleFilter]);

  const filteredOfficers = useMemo(() => {
    return officers;
  }, [officers, roleFilter]);

  const handleUpdateAccess = useCallback(
    async (id_number: string, newAccess: PsitsRole) => {
      const result = await updateOfficerAccess(id_number, newAccess);
      if (result === true || (result as unknown as number) === 200) {
        setOfficers((prev) =>
          prev.map((o) => (o.id_number === id_number ? { ...o, access: newAccess } : o))
        );
        showToast("success", "Officer access updated successfully.");
      } else {
        showToast("error", result === undefined ? "Failed to update access." : String(result));
      }
    },
    []
  );

  const handleSavePrice = useCallback(async () => {
    const success = await updateMembershipPrice(Number(priceDraft));
    if (success) {
      setMembershipPrice(Number(priceDraft));
      setPriceEditMode(false);
      showToast("success", "Membership price updated successfully.");
    } else {
      showToast("error", "Failed to update membership price.");
    }
  }, [priceDraft]);

  const handleRevoke = useCallback(async () => {
    const success = await revokeAllActiveMemberships();
    if (success) {
      showToast("success", "All active memberships have been revoked.");
    } else {
      showToast("error", "Failed to revoke memberships.");
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    officers: filteredOfficers,
    officerLoading,
    isAdminAccess,
    isUcMainAdmin,
    roleFilter,
    setRoleFilter,
    membershipPrice,
    priceDraft,
    setPriceDraft,
    priceEditMode,
    setPriceEditMode,
    confirmPrice,
    setConfirmPrice,
    confirmRevoke,
    setConfirmRevoke,
    confirmChangePassword,
    setConfirmChangePassword,
    confirmEditAccount,
    setConfirmEditAccount,
    currentAccess: user?.access,
    handleUpdateAccess,
    handleSavePrice,
    handleRevoke,
  };
};
