import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuthentication } from "./Authentication";
import axios from "axios";
import backendConnection from "../api/backendApi";

const PrivateRouteStudent = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

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
        console.error("Not authorized:", error);
        setIsAuthenticated(false); // Set to false on error
      } finally {
        setLoading(false); // Set loading to false regardless of outcome
      }
    };

    checkAuthentication();
  }, []);

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>; // You can customize this loading state
  }

  return isAuthenticated ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRouteStudent;
