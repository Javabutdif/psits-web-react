import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthentication } from "./Authentication";

const isAuthenticated = () => {
  const authToken = getAuthentication();
  return authToken === "Administrator"; // Adjust the check based on your authentication logic
};

const PrivateRouteAdmin = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRouteAdmin;
