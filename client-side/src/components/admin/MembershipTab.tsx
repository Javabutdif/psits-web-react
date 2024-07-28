import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import FormButton from '../../components/forms/FormButton';
import {
  allMembers,
  totalRequest,
  totalRenewal,
  totalDeleted,
  totalHistory,
} from "../../api/admin";

const MembershipTab = () => {
  const [counts, setCounts] = useState({
    allMembers: 0,
    request: 0,
    renewals: 0,
    deleted: 0,
    history: 0,
  });

  const location = useLocation();
  const currentPath = location.pathname;

  const fetchData = async () => {
    try {
      const [allMembersCount, requestCount, renewalCount, deletedCount, historyCount] = await Promise.all([
        allMembers(),
        totalRequest(),
        totalRenewal(),
        totalDeleted(),
        totalHistory(),
      ]);

      setCounts({
        allMembers: allMembersCount,
        request: requestCount,
        renewals: renewalCount,
        deleted: deletedCount,
        history: historyCount,
      });
    } catch (err) {
      console.error("Error fetching membership data: ", err);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 100);

    return () => clearInterval(intervalId);
  }, []);

  const getTabClassName = (path) => {
    return currentPath === path
      ? "w-full py-2 text-gray-700 bg-gray-200 rounded-md flex items-center justify-center text-xs md:text-sm lg:text-base"
      : "w-full py-2 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none flex items-center justify-center text-xs md:text-sm lg:text-base";
  };

  const tabs = [
    { path: "/admin/membership", text: `All Members ${counts.allMembers}`, icon: "fas fa-users" },
    { path: "/admin/membership/request", text: `Request ${counts.request}`, icon: "fas fa-hand-paper" },
    { path: "/admin/membership/renewal", text: `Renewals ${counts.renewals}`, icon: "fas fa-refresh" },
    { path: "/admin/membership/delete", text: `Deleted ${counts.deleted}`, icon: "fas fa-trash-alt" },
    { path: "/admin/membership/history", text: `History ${counts.history}`, icon: "fas fa-history" },
  ];

  return (
    <div className="max-w-[1000px] grid grid-flow-row sm:grid-flow-col gap-1 bg-white rounded-t-lg p-2 shadow-sm text-xs md:text-sm lg:text-base">
      {tabs.map((tab, index) => (
        <React.Fragment key={index}>
          <Link to={tab.path} className="flex-1 min-w-[100px]">
            <FormButton
              type="button"
              text={tab.text}
              icon={<i className={`${tab.icon} text-lg mr-1`}></i>}
              styles={getTabClassName(tab.path)}
            />
          </Link>
          {index < tabs.length - 1 && (
            <div className="border-r border-gray-300 h-6 hidden md:block mx-1"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MembershipTab;
