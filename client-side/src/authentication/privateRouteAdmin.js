import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthentication } from "./localStorage";

const isAuthenticated = () => {
  const authToken = getAuthentication("AuthenticationToken");
  return authToken !== null && authToken === "Admin";
};

const PrivateRouteAdmin = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRouteAdmin;
