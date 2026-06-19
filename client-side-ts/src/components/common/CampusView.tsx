import React from "react";
import { useCampusCheck } from "@/features/auth/hooks/useCampusCheck";
import type { Campus } from "@/features/auth/types/auth.types";

interface CampusViewProps {
  /** The list of campuses that are allowed to see the content. */
  allowedCampuses: Campus[];
  /** The user role required to view the content. Defaults to "Admin". */
  role?: "admin" | "student";
  /** The content to render if the user's campus is in the allowed list. */
  children: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the authenticated
 * user has the required role and belongs to one of the specified campuses.
 *
 * It renders nothing if the user does not have the required role or if
 * their campus is not in the `allowedCampuses` list.
 */
export function CampusView({
  allowedCampuses,
  role = "admin",
  children,
}: CampusViewProps) {
  const canView = useCampusCheck(allowedCampuses, role);

  return canView ? <>{children}</> : null;
}
