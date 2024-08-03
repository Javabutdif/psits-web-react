import React, { useState, useEffect } from 'react';
import MembershipTab from '../../components/admin/MembershipTab';
import { Outlet, useLocation } from 'react-router-dom';
import Tab from '../../components/Tab';
import {
  allMembers,
  totalRequest,
  totalRenewal,
  totalDeleted,
  totalHistory,
} from "../../api/admin";

const Membership = () => {
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
    const intervalId = setInterval(fetchData, 300); // Increased interval time for practicality

    return () => clearInterval(intervalId);
  }, []);

  const tabs = [
    { path: "/admin/membership", text: `All Members ${counts.allMembers}`, icon: "fas fa-users" },
    { path: "/admin/membership/request", text: `Request ${counts.request}`, icon: "fas fa-hand-paper" },
    { path: "/admin/membership/renewal", text: `Renewals ${counts.renewals}`, icon: "fas fa-refresh" },
    { path: "/admin/membership/delete", text: `Deleted ${counts.deleted}`, icon: "fas fa-trash-alt" },
    { path: "/admin/membership/history", text: `History ${counts.history}`, icon: "fas fa-history" },
  ];

  return (
    <div className="flex flex-col bg-gray-100 overflow-hidden">
      <div className="w-full flex flex-col">
        <Tab tabs={tabs} styles={"grid md:grid-cols-3 lg:grid-cols-5"} activePath={currentPath} />
      </div>
      <Outlet />
    </div>
  );
};

export default Membership;
