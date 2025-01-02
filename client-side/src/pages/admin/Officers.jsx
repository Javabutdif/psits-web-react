import React, { useState, useEffect, useCallback } from "react";
import MembershipTab from "../../components/admin/MembershipTab";
import { Outlet, useLocation } from "react-router-dom";
import Tab from "../../components/Tab";

import { InfinitySpin } from "react-loader-spinner";

const Officers = () => {
  const [counts, setCounts] = useState({
    allMembers: 0,
    request: 0,
    renewals: 0,
    deleted: 0,
    history: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    {
      path: "/admin/officers",
      text: `All Officers`,
      icon: "fas fa-users",
    },
    {
      path: "/admin/officers/suspend",
      text: `Suspended `,
      icon: "fas fa-hand-paper",
    },
  ];

  return (
    <div>
      <div className="flex flex-col py-4 space-y-4">
        <div className="w-full flex flex-col">
          <Tab
            tabs={tabs}
            styles={"flex flex-col lg:flex-row items-stretch"}
            activePath={currentPath}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Officers;
