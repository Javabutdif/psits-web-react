import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Tab from "../../components/Tab";

function StudentOrders() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Update the icons here
  const tabs = [
    { path: "/student/orders", text: `Pending`, icon: "fas fa-clock" }, // Changed to a clock icon
    { path: "/student/orders/paid", text: `Paid`, icon: "fas fa-check-circle" }, // Changed to a check-circle icon
  ];
  return (
    <main className="py-5 ">
      <Tab tabs={tabs} activePath={currentPath} styles={"grid grid-cols-2"} />
      <Outlet />
    </main>
  );
}

export default StudentOrders;
