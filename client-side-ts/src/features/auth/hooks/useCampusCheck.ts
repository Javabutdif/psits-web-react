import { useAuth } from "@/features/auth";
import type { Campus } from "@/features/auth/types/auth.types";
import { normalizeCampus } from "@/features/auth/utils/campus";

/**
 * A hook to check if the current user belongs to one of the specified campuses.
 *
 * @param allowedCampuses An array of campuses that are allowed.
 * @param requiredRole The role required to check against. Defaults to "Admin".
 * @returns `true` if the user has the required role and their campus is in the list, otherwise `false`.
 */
export function useCampusCheck(
  allowedCampuses: Campus[],
  requiredRole: "admin" | "student" = "admin"
): boolean {
  const { user } = useAuth();

  if (!user || user.role !== requiredRole || !user.campus) {
    return false;
  }

  const currentCampus = normalizeCampus(user.campus);
  return allowedCampuses.some(
    (campus) => normalizeCampus(campus) === currentCampus
  );
}
