import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { motion } from "framer-motion";
import { showToast } from "../../../utils/alertHelper";
import { removeAuthentication } from "../../../authentication/Authentication";
import { removeStudentData } from "../../../utils/editStudentData";

const AsideBar = ({ navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const currentPath = location.pathname.split('/')[2]; // Extract current path segment

  // Handle logout
  const handleLogout = () => {
    removeAuthentication();
    removeStudentData();
    showToast("success", "Signed out successfully");
    navigate('/login'); // Redirect to login page or another appropriate page
  };

  const getLogoLink = () => 
    location.pathname.split('/')[1] === "admin" ? "/admin/" : "/student/";

  return (
    <motion.aside
      className="z-50 fixed top-0 left-0 min-h-screen bg-primary shadow-2xl overflow-hidden flex flex-col justify-between"
      initial={{ width: '70px' }}
      animate={{ width: isHovered ? '200px' : '70px' }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center py-4 px-3">
        <Link to={`${getLogoLink()}dashboard`}>
          <img src={logo} alt="PSITS Logo" className="w-10" />
        </Link>
      </div>
      <nav className="flex-1 flex flex-col h-full">
        <ul className="space-y-2 md:space-y-3 py-3 px-3">
          {navItems.map((item) => (
            <motion.li
              key={item.path}
              className="flex items-center rounded-lg"
              initial={{ opacity: 1 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link
               to={`${getLogoLink()}${item.path}`}
                className={`flex flex-1 items-center p-3 rounded-lg transition-colors duration-300 ${
                  currentPath === item.path ? 'bg-custom-active text-custom-active-text' : 'text-custom-text hover:bg-custom-hover'
                }`}
              >
                <i className={`fa ${item.icon} text-xl`} aria-hidden="true"></i>
                <motion.span
                  className={`ml-4 text-sm font-medium whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: 0 }}
                  transition={{ opacity: { duration: 0.3 }, x: { duration: 0.3 } }}
                >
                  {item.text}
                </motion.span>
              </Link>
            </motion.li>
          ))}
        </ul>
        <motion.button
          onClick={handleLogout}
          className="mt-auto flex items-center mb-6 mx-4 px-4 py-2 bg-custom-logout text-custom-logout-text rounded-lg transition-colors duration-300 hover:bg-custom-logout-hover"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-sign-out-alt text-lg" aria-hidden="true" />
          <motion.span
            className={`ml-2 text-sm font-medium whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: isHovered ? 1 : 0, x: 0 }}
            transition={{ opacity: { duration: 0.3 }, x: { duration: 0.3 } }}
          >
            Logout
          </motion.span>
        </motion.button>
      </nav>
    </motion.aside>
  );
};

export default AsideBar;
