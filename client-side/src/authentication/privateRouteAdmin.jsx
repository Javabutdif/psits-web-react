import backendConnection from "../api/backendApi";
import { setInformationData } from "./Authentication";
import { getInformationData } from "./Authentication";
import axios from "axios";
import { React, useState, useEffect } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Navigate, useLocation } from "react-router-dom";
import {
  executiveAndAdminConditionalAccess,
  financeConditionalAccess,
  restrictedComponent,
  restrictedComponentOtherCampus,
  noneConditionalAccess,
} from "../components/tools/clientTools";

const PrivateRouteAdmin = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("Token");
  const location = useLocation();
  const lastPart = location.pathname.split("/").pop();
  const secondToTheLast = location.pathname.split("/").slice(-2, -1)[0];
  const thirdToTheLast = location.pathname.split("/").slice(-3)[0];
  const fifthToTheLast = location.pathname.split("/").slice(-6, -4)[0];
  const user = getInformationData();

  const unauthorized =
    !executiveAndAdminConditionalAccess() &&
    !financeConditionalAccess() &&
    restrictedComponent().includes(lastPart);
  const campus = user.campus === "UC-Main";
  const other_campus_authorized =
    restrictedComponentOtherCampus().includes(fifthToTheLast) ||
    restrictedComponentOtherCampus().includes(secondToTheLast) ||
    restrictedComponentOtherCampus().includes(thirdToTheLast) ||
    restrictedComponentOtherCampus().includes(lastPart);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get(
        `${backendConnection()}/api/protected-route-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInformationData(response.data.user, response.data.user.role);
      if (response.data.user.role === "Admin") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Not authorized:");
      //window.location.reload();
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

  return unauthorized && campus && !noneConditionalAccess() ? (
    <Navigate to="/admin/dashboard" replace />
  ) : !campus && !other_campus_authorized && !noneConditionalAccess() ? (
    <Navigate to="/admin/events" replace />
  ) : isAuthenticated && !noneConditionalAccess() ? (
    <Component />
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRouteAdmin;
