import React from "react";
import { Route, useNavigate } from "react-router-dom";
import { getAuthentication } from "./LocalStorage";

// Function to check if user is authenticated
const isAuthenticated = () => {
  const authToken = getAuthentication("AuthenticationToken");
  return authToken !== null && authToken === "Admin";
};

const PrivateRouteAdmin = ({ component: Component, ...rest }) => {
  const navigate = useNavigate();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? <Component {...props} /> : navigate("/login")
      }
    />
  );
};

export default PrivateRouteAdmin;
