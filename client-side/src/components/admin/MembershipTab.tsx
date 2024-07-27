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

const MembershipTab = ({ styles }) => {
  const [counts, setCounts] = useState({
    allMembers: 0,
    request: 0,
    renewals: 0,
    deleted: 0,
    history: 0,
  });

  const location = useLocation(); // Get the current location
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
    fetchData(); // Fetch data on component mount

    const intervalId = setInterval(fetchData, 100); // Poll for new data every 30 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  // Determine if a tab is active
  const getTabClassName = (path) => {
    return currentPath === path
      ? "w-full py-2 text-gray-700 bg-gray-200 rounded-md flex items-center justify-center"
      : "w-full py-2 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none flex items-center justify-center";
  };

  return (
    <div className={`${styles} flex flex-wrap items-center bg-white rounded-t-lg p-2 shadow-sm text-sm`}>
      <Link to="/admin/membership" className="flex-1 min-w-[120px]">
        <FormButton
          type="button"
          text={`All Members ${counts.allMembers}`}
          icon={<i className="fas fa-users text-lg mr-2"></i>}  // Added margin-right for spacing
          styles={getTabClassName("/admin/membership/members")}
        />
      </Link>
      <div className="border-r border-gray-300 h-6 hidden md:block mx-2"></div>
      <Link to="/admin/membership/request" className="flex-1 min-w-[120px]">
        <FormButton
          type="button"
          text={`Request ${counts.request}`}
          icon={<i className="fas fa-hand-paper text-lg mr-2"></i>}  // Added margin-right for spacing
          styles={getTabClassName("/admin/membership/request")}
        />
      </Link>
      <div className="border-r border-gray-300 h-6 hidden md:block mx-2"></div>
      <Link to="/admin/membership/renewal" className="flex-1 min-w-[120px]">
        <FormButton
          type="button"
          text={`Renewals ${counts.renewals}`}
          icon={<i className="fas fa-refresh text-lg mr-2"></i>}  // Added margin-right for spacing
          styles={getTabClassName("/admin/membership/renewal")}
        />
      </Link>
      <div className="border-r border-gray-300 h-6 hidden md:block mx-2"></div>
      <Link to="/admin/membership/delete" className="flex-1 min-w-[120px]">
        <FormButton
          type="button"
          text={`Deleted ${counts.deleted}`}
          icon={<i className="fas fa-trash-alt text-lg mr-2"></i>}  // Added margin-right for spacing
          styles={getTabClassName("/admin/membership/delete")}
        />
      </Link>
      <div className="border-r border-gray-300 h-6 hidden md:block mx-2"></div>
      <Link to="/admin/membership/history" className="flex-1 min-w-[120px]">
        <FormButton
          type="button"
          text={`History ${counts.history}`}
          icon={<i className="fas fa-history text-lg mr-2"></i>}  // Added margin-right for spacing
          styles={getTabClassName("/admin/membership/history")}
        />
      </Link>
    </div>
  );
};

export default MembershipTab;
