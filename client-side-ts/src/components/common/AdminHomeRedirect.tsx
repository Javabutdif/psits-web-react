import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Home } from "@/pages/home";

export const AdminHomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
};
