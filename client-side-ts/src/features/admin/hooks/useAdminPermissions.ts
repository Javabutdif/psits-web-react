import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import {
  PSITS_ROLES,
  type PsitsRole,
} from "@/features/admin/constants/adminAccess";

const PSITS_PREFIX = "PSITS_";

const normalizeAccess = (access?: string): PsitsRole | undefined => {
  if (!access) return undefined;
  const upper = access.trim().toUpperCase();
  const suffix = upper.startsWith(PSITS_PREFIX)
    ? upper.slice(PSITS_PREFIX.length)
    : upper;
  for (const value of Object.values(PSITS_ROLES)) {
    const candidate = value.startsWith(PSITS_PREFIX)
      ? value.slice(PSITS_PREFIX.length)
      : value;
    if (candidate === suffix) return value;
  }
  return undefined;
};

export const isViewOnlyAccess = (
  access?: PsitsRole
): access is typeof PSITS_ROLES.STANDARD | typeof PSITS_ROLES.NO_ACCESS =>
  access === PSITS_ROLES.STANDARD || access === PSITS_ROLES.NO_ACCESS;

export function useAdminPermissions() {
  const { user } = useAuth();

  const access = normalizeAccess(user?.access);
  const isAdmin = user?.role === "admin";
  const isUcMainAdmin =
    isAdmin &&
    !!user?.campus &&
    normalizeCampus(user.campus) === "UC_MAIN";

  const canMutate =
    isAdmin && access !== undefined && !isViewOnlyAccess(access);
  const canManageOrders =
    isUcMainAdmin &&
    access !== undefined &&
    (access === PSITS_ROLES.ADMIN ||
      access === PSITS_ROLES.FINANCE ||
      access === PSITS_ROLES.HEAD_FINANCE);
  const canManageEvents = canMutate;
  const canManagePromo = canMutate;
  const canManageCertificates = canMutate;
  const canManageRaffle = canMutate;
  const canManageRecruitment = canMutate;

  return {
    user,
    access,
    isAdmin,
    isUcMainAdmin,
    canMutate,
    canManageOrders,
    canManageEvents,
    canManagePromo,
    canManageCertificates,
    canManageRaffle,
    canManageRecruitment,
  };
}
