import ProtectedRoute from "@/components/common/ProtectedRoute";

/**
 * Route guard wrapper for Student-only routes.
 * Wrap route groups with this component to require Student role.
 */
export function StudentRouteGuard() {
  return <ProtectedRoute allowedRoles={["student"]} />;
}

/**
 * Route guard wrapper for Admin-only routes.
 * Wrap route groups with this component to require Admin role.
 */
export function AdminRouteGuard() {
  return <ProtectedRoute allowedRoles={["admin"]} />;
}
