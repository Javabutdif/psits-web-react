import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import backendConnection from "../api/backendApi";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";

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
        console.error("Not authorized:");
        setIsAuthenticated(false);
      } finally {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60vh">
        <InfinitySpin
          visible={true}
          width={200}
          color="#0d6efd"
          ariaLabel="infinity-spin-loading"
        />
      </div>
    );
  }

  return isAuthenticated ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRouteAdmin;
