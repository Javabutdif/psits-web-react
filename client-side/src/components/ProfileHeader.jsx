import React from 'react';
import Notification from "./common/Notification";
import Profile from "./common/Profile";

const ProfileHeader = ({ label }) => {
  return (
    <header className="ml-[4rem] md:ml-[5rem] 2xl:ml-[15rem]">
      <div className="flex items-center justify-between py-4 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold uppercase">
          {label}
        </h2>
        <div className="flex items-center gap-4 sm:gap-3 md:gap-4 lg:gap-6 text-sm sm:text-base md:text-lg">
          <Notification />
          <Profile />
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
