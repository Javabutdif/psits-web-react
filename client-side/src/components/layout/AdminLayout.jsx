import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AsideBar from "../common/navbar/AsideBar";
import ProfileHeader from "../ProfileHeader";

const AdminLayout = () => {
  const location = useLocation();
  const [label, setLabel] = useState("");

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const extractedLabel = pathParts[2];
    setLabel(
      extractedLabel === "profile" ? "Account Settings" : extractedLabel
    );
  }, [location]);

  const navItems = [
    { text: "Dashboard", icon: "fas fa-tachometer-alt", path: "dashboard" },
    { text: "Membership", icon: "fas fa-users", path: "membership" },
    { text: "Merchandise", icon: "fas fa-boxes", path: "merchandise" },
    { text: "Inventory", icon: "fas fa-warehouse", path: "inventory" },
    { text: "Orders", icon: "fas fa-shopping-cart", path: "orders" },
    { text: "Analytics", icon: "fas fa-chart-line", path: "analytics" },
    { text: "Resources", icon: "fas fa-book-open", path: "resources" },
    { text: "Settings", icon: "fas fa-cog", path: "settings" },
  ];
  
  return (
    <div className="flex w-full min-h-screen">
      <AsideBar navItems={navItems} />
      <div className="flex-1 ml-[4.4rem] min-h-screen  md:px-4: px-3 md:px-4: lg:px-6">
        <ProfileHeader label={label} /> 
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
