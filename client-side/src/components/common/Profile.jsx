import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../authentication/Authentication";

const Profile = () => {
  const location = useLocation().pathname.split("/")[1];
  const [name, course, position] = getUser();

  return (
    <div className="flex space-x-4  rounded-lg">
      <Link
        to={`/${
          location === "admin"
            ? "admin"
            : location === "student"
            ? "student"
            : ""
        }/profile`}
        className="flex items-center text-gray-700  hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        aria-label="Profile"
      >
        <i className="fas fa-user text-xl sm:text-2xl" aria-hidden="true"></i>
      </Link>
      <div className="hidden sm:block">
        <h3 className="text-sm font-semibold text-gray-800">
          {name}
        </h3>
        <span className="text-xs text-gray-600  block">
          {position ? position : course}
        </span>
      </div>
    </div>
  );
};

export default Profile;
