import React from 'react';
import Notification from './common/Notification';
import Profile from './common/Profile';
import { Link } from 'react-router-dom';

const ProfileHeader = ({ label }) => {
  return (
    <div className="z-10 top-2 fixed sm:w-header-sm w-header">
      <div className="flex justify-between items-center gap-2 max-w-[1400px] mx-auto bg-white p-4 sm:py-2 px-4  rounded-md shadow-sm">
        <h1 className="text-md sm:text-lg md:text-xl font-bold capitalize">{label}</h1>
        <div className="flex items-center gap-4 sm:gap-6 text-base sm:text-lg">
          <Notification />
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
