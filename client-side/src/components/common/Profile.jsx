import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser, getId } from "../../authentication/Authentication";
import { getMembershipStatusStudents } from "../../api/students";

const Profile = () => {
  const location = useLocation().pathname.split("/")[1];
  const [name, position] = getUser();
  const [status, setStatus] = useState({ membership: "", renew: "" });

  if (position === "N/A") {
    useEffect(() => {
      const fetchStatus = async () => {
        const membershipStatus = await getMembershipStatusStudents(getId());
        setStatus(membershipStatus);
      };

      fetchStatus();
      console.log(status.membership);
    }, []);
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        to={`/${
          location === "admin"
            ? "admin"
            : location === "student"
            ? "student"
            : ""
        }/profile`}
        className="text-sm md:text-sm"
      >
        <i className="fas fa-user text-lg"></i>
      </Link>
      <h3 className="text-xs sm:text-sm hidden sm:block">
        {name}
        <span className="text-xs block">
          {position === "N/A" ? "Membership: " : ""}
          <span
            className={`inline-block rounded ${
              (status.membership === "Accepted" && status.renew === "None") ||
              status.renew === "Accepted"
                ? "bg-green-500 text-white"
                : status.membership === "Pending"
                ? "bg-yellow-500 text-yellow-100"
                : status.membership === "None" || status.renew === "Pending"
                ? "bg-gray-500 text-white"
                : ""
            }`}
          >
            {position !== "N/A"
              ? position
              : (status.membership === "Accepted" && status.renew === "None") ||
                status.renew === "Accepted"
              ? "Active"
              : status.membership === "Pending"
              ? "Pending"
              : "None"}
          </span>
        </span>
      </h3>
    </div>
  );
};

export default Profile;
