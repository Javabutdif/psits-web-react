import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import backendConnection from "../api/backendApi";
import axios from "axios";

const PrivateRouteAdmin = ({ element: Component }) => {
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

        if (response.data.role === "Admin") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("privateRouteAdmin");
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

export default PrivateRouteAdmin;
