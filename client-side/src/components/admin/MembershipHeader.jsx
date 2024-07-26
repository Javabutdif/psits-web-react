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
  const [selectedAllMembers, setAllMembers] = useState();
  const [selectedRequestMembers, setRequestMembers] = useState();
  const [selectedRenewalMembers, setRenewalMembers] = useState();
  const [selectedDeletedMembers, setDeletedMembers] = useState();
  const [selectedHistoryMembers, setHistoryMembers] = useState();

  const getAllMembers = async () => {
    try {
      const members = await allMembers();
      const request = await totalRequest();
      const renewal = await totalRenewal();
      const deleted = await totalDeleted();
      const history = await totalHistory();
      setAllMembers(members);
      setRequestMembers(request);
      setRenewalMembers(renewal);
      setDeletedMembers(deleted);
      setHistoryMembers(history);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllMembers();
  }, []);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-4">
        <Link to={"/admin/membership"}>
          <button className="px-4 py-2 bg-gray-200 rounded">
            All Members ({selectedAllMembers})
          </button>
        </Link>
        <Link to={"/admin/request"}>
          <button className="px-4 py-2 bg-gray-200 rounded">
            Requests ({selectedRequestMembers})
          </button>
        </Link>
        <Link to={"/admin/renewal"}>
          <button className="px-4 py-2 bg-gray-200 rounded">
            Renewal ({selectedRenewalMembers})
          </button>
        </Link>
        <Link to={"/admin/delete"}>
          <button className="px-4 py-2 bg-gray-200 rounded">
            Deleted ({selectedDeletedMembers})
          </button>
        </Link>
        <Link to={"/admin/history"}>
          <button className="px-4 py-2 bg-gray-200 rounded">
            History({selectedHistoryMembers})
          </button>
        </Link>
      </div>
    </div>
  );
}

export default MembershipHeader;
