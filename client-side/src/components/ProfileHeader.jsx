import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Notification from "./common/Notification";
import Profile from "./common/Profile";

const ProfileHeader = ({ label }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) {
        // Scroll down
        setIsVisible(false);
      } else {
        // Scroll up
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // Cleanup the event listener
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 w-header md:w-header-md lg:w-header-lg z-40"
    >
      <div className="flex justify-between items-center gap-2 py-3 px-3 md:py-4 md:px-6 bg-white rounded-sm shadow-sm">
        <h1 className="text-sm md:text-lg lg:text-xl font-bold capitalize">
          {label}
        </h1>
        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-sm md:text-base lg:text-lg">
          <Notification />
          <Profile />
        </div>
      </div>
    </motion.header>
  );
};

export default ProfileHeader;
