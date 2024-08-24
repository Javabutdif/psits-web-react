import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AsideBar from "../common/navbar/AsideBar";
import ProfileHeader from "../ProfileHeader";

const StudentLayout = () => {
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
    { text: "Merchandise", icon: "fas fa-boxes", path: "merchandise" },
    { text: "Resources", icon: "fas fa-book-open", path: "resources" },
    { text: "Orders", icon: "fas fa-shopping-cart", path: "orders" },
    { text: "Settings", icon: "fas fa-cog", path: "settings" }
  ];

  return (
    <div className="min-h-screen relative">
      <AsideBar navItems={navItems}/>
      <ProfileHeader label={label} /> 
      <main className="ml-[4rem] md:ml-[5rem] 2xl:ml-[15rem] min-h-screen px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <Outlet />
      </main>
    </div>
  )
} 

export default StudentLayout
