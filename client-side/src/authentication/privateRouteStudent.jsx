import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthentication } from "./localStorage";

const isAuthenticated = () => {
  const authToken = getAuthentication("AuthenticationToken");
  return authToken !== null && authToken === "Student";
};

const PrivateRouteStudent = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/" />;
};

export default PrivateRouteStudent;
