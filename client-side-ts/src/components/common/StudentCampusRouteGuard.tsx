import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Campus } from "@/features/auth/types/auth.types";

interface CampusRouteGuardProps {
  allowedCampuses: Campus[];
}

/**
 * A route guard that requires the user to be a Student and belong to one
 * of the specified campuses.
 *
 * @example
 * <Route element={<StudentCampusRouteGuard allowedCampuses={["UC-Main"]} />}>
 *   <Route path="student-uc-main-only" element={SomeStudentPage} />
 * </Route>
 */
export function StudentCampusRouteGuard({
  allowedCampuses,
}: CampusRouteGuardProps) {
  return (
    <ProtectedRoute
      allowedRoles={["student"]}
      allowedCampuses={allowedCampuses}
    />
  );
}
