import React from 'react';
import { motion } from 'framer-motion';
import Notification from "./common/Notification";
import Profile from "./common/Profile";

const ProfileHeader = ({ label, toggleSidebar }) => {
  return (
    <header className={`
      transition-all duration-300
      lg:ml-[15rem]
    `}>
      <div className="flex items-center justify-between py-4 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center">
          <motion.button
            className="mr-4 p-2 rounded-full bg-gray-200 text-gray-800 lg:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold uppercase">
            {label}
          </h2>
        </div>
        <div className="flex items-center gap-4 sm:gap-3 md:gap-4 lg:gap-6 text-sm sm:text-base md:text-lg">
          <Notification />
          <Profile />
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;