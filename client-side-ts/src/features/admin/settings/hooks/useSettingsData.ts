import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";
import {
  fetchMembershipPrice,
  updateMembershipPrice,
  revokeAllActiveMemberships,
} from "../api/settings.api";
import type { SettingsTab } from "../types/settings.types";
import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";

export const useSettingsData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("membership");

  // Membership state
  const [membershipPrice, setMembershipPrice] = useState(0);
  const [priceDraft, setPriceDraft] = useState("");
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [confirmPrice, setConfirmPrice] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const isUcMainAdmin =
    user?.role === "admin" && normalizeCampus(user.campus) === "UC-MAIN";

  const isAdminAccess = isUcMainAdmin && user?.access === PSITS_ROLES.ADMIN;

  const isPriceAdminAccess = isUcMainAdmin && (
    user?.access === PSITS_ROLES.ADMIN ||
    user?.access === PSITS_ROLES.HEAD_FINANCE ||
    user?.access === PSITS_ROLES.FINANCE
  );

  useEffect(() => {
    const load = async () => {
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
    void load();
    // price endpoint only; do not depend on user mutable object
  }, []);

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
    isPriceAdminAccess, // renamed from isAdminAccess for price
    isAdminAccess, // for account panel & officer access checks
    isUcMainAdmin,
    membershipPrice,
    priceDraft,
    setPriceDraft,
    priceEditMode,
    setPriceEditMode,
    confirmPrice,
    setConfirmPrice,
    confirmRevoke,
    setConfirmRevoke,
    currentAccess: user?.access,
    handleSavePrice,
    handleRevoke,
  };
};
