import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../common/navbar/NavbarStudent";
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

  return (
    <div className="flex w-full bg-secondary min-h-screen">
      <SideBar /> {/* Example: Admin sidebar */}
      <main className="flex-1 ml-16 px-2 sm:px-4 sm:ml-20">
        <ProfileHeader label={label} />
        <div className="relative min-h-main-md md:min-h-main  mt-[4.3rem] sm:mt-16 py-3 sm:py-5 md:py-10  mx-auto">
          <Outlet /> {/* This is where nested routes will be rendered */}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
