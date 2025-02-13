import backendConnection from "../api/backendApi";
import { setInformationData } from "./Authentication";
import axios from "axios";
import { React, useState, useEffect } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Navigate } from "react-router-dom";
import {
  presidentPosition,
  headDevPosition,
  higherPosition,
  treasurerPosition,
  restrictedComponent,
} from "../components/tools/clientTools";
const PrivateRouteAdmin = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("Token");
  const unauthorized =
    !higherPosition() &&
    !treasurerPosition() &&
    restrictedComponent().includes(Component.name);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get(
        `${backendConnection()}/api/protected-route`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInformationData(response.data.user, response.data.role);
      if (response.data.role === "Admin") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Not authorized:");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen flex justify-center items-center bg-gray-100 px-4">
        <div className="flex justify-center items-center h-60vh">
          <InfinitySpin
            visible={true}
            width={200}
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      </div>
    );
  }
  console.log(
    "Check : " +
      Component.name +
      ": " +
      unauthorized +
      " Other check: " +
      isAuthenticated
  );
  return unauthorized ? (
    <Navigate to="/admin/dashboard" replace />
  ) : isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRouteAdmin;
