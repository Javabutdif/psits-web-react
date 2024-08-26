import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AsideBar from "../common/navbar/AsideBar";
import ProfileHeader from "../ProfileHeader";

const AdminLayout = () => {
  const location = useLocation();
  const [label, setLabel] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const extractedLabel = pathParts[2];
    setLabel(
      extractedLabel === "profile" ? "Account Settings" : extractedLabel
    );
  }, [location]);


  const toggleSidebar = () => setIsSidebarOpen(true)
  
  useEffect(() => {
    console.log(isSidebarOpen)
  })

  const navItems = [
    { text: "Dashboard", icon: "fas fa-tachometer-alt", path: "dashboard" },
    { text: "Membership", icon: "fas fa-users", path: "membership" },
    { text: "Merchandise", icon: "fas fa-boxes", path: "merchandise" },
    { text: "Inventory", icon: "fas fa-warehouse", path: "inventory" },
    { text: "Orders", icon: "fas fa-shopping-cart", path: "orders" },
    { text: "Reports", icon: "fas fa-chart-line", path: "reports" },
    { text: "Resources", icon: "fas fa-book-open", path: "resources" },
    { text: "Settings", icon: "fas fa-cog", path: "settings" },
  ];

  return (
    <div className="min-h-screen relative">
      <AsideBar navItems={navItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
      <ProfileHeader 
        label={label} 
        toggleSidebar={toggleSidebar}
      /> 
      <main className="2xl:ml-[15rem] min-h-main-md px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
