import React from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import Tab from '../../components/Tab'


const Orders = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  // Update the icons here
  const tabs = [
    { path: "/admin/orders", text: `Pending`, icon: "fas fa-clock" }, // Changed to a clock icon
    { path: "/admin/orders/paid", text: `Paid`, icon: "fas fa-check-circle" }, // Changed to a check-circle icon
  ];

  return (
    <div className="mt-16 md:mt-20 lg:mt-[5.5rem]">
      <Tab tabs={tabs} styles={"grid grid-cols-2"} activePath={currentPath}  />
      <Outlet />
    </div>
  )
}

export default Orders
