import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../authentication/Authentication";

const Profile = () => {
  const location = useLocation().pathname.split("/")[1];
  const [name, course, position] = getUser();

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
          <span className="inline-block rounded">
            {position ? position : course}
          </span>
        </span>
      </h3>
    </div>
  );
};

export default Profile;
