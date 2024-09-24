import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import axios from "axios";
import backendConnection from "../api/backendApi";

const PrivateRouteStudent = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(
          `${backendConnection()}/api/protected-route`,
          {
            withCredentials: true,
          }
        );

        if (response.data.role === "Student") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("privateRouteStudent");
        console.error("Not authorized:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRouteStudent;
