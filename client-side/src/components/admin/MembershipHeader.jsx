import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  allMembers,
  totalRequest,
  totalRenewal,
  totalDeleted,
  totalHistory,
} from "../../api/admin";

function MembershipHeader() {
  const [counts, setCounts] = useState({
    allMembers: 0,
    requests: 0,
    renewals: 0,
    deleted: 0,
    history: 0,
  });

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
        requests: requestCount,
        renewals: renewalCount,
        deleted: deletedCount,
        history: historyCount,
      });
    } catch (error) {
      console.error("Error fetching membership data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount

    const intervalId = setInterval(() => {
      fetchData(); // Poll for new data every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  return (
    <div className="flex items-center justify-between mb-4 bg-white">
      <div className="flex space-x-4">
        <Link to="/admin/membership">
          <button className="px-4 py-2 bg-gray-200 rounded">
            All Members ({counts.allMembers})
          </button>
        </Link>
        <Link to="/admin/request">
          <button className="px-4 py-2 bg-gray-200 rounded">
            Requests ({counts.requests})
          </button>
        </Link>
        <Link to="/admin/renewal">
          <button className="px-4 py-2 bg-gray-200 rounded">
            Renewals ({counts.renewals})
          </button>
        </Link>
        <Link to="/admin/delete">
          <button className="px-4 py-2 bg-gray-200 rounded">
            Deleted ({counts.deleted})
          </button>
        </Link>
        <Link to="/admin/history">
          <button className="px-4 py-2 bg-gray-200 rounded">
            History ({counts.history})
          </button>
        </Link>
      </div>
    </div>
  );
}

export default MembershipHeader;
