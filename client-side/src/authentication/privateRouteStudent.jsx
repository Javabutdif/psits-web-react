import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthentication } from "./Authentication";

const isAuthenticated = () => {
  const authToken = getAuthentication();
  return authToken !== null && authToken === "Student";
};

const PrivateRouteStudent = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/" replace/>;
};

export default PrivateRouteStudent;
