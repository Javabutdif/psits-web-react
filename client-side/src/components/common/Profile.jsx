import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../authentication/Authentication";

const Profile = () => {
  const location = useLocation().pathname.split("/")[1];
  const [name, position] = getUser();

  return (
    <div className="flex items-center space-x-3">
      <Link
        to={`/${
          location === "admin"
            ? "admin"
            : location === "student"
            ? "student"
            : ""
        }/profile`}
        className="text-xl md:text-2xl"
      >
        <i className="fas fa-user"></i>
      </Link>
      <h3 className="text-sm sm:text-base md:text-lg hidden sm:block">
        {name}
        <span className="text-xs md:text-sm block">{position}</span>
      </h3>
    </div>
  );
};

export default Profile;
