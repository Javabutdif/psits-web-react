import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { motion } from "framer-motion";
import { showToast } from "../../../utils/alertHelper";
import { removeAuthentication } from "../../../authentication/Authentication";
import { removeStudentData } from "../../../utils/editStudentData";

const AsideBar = ({ navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/')[2]; // Extract current path segment

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isHovered, setIsHovered] = useState(false);

  // Debounce resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const debouncedHandleResize = debounce(handleResize, 200);

    window.addEventListener("resize", debouncedHandleResize);
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);

  // Use useMemo to optimize getLogoLink computation
  const getLogoLink = useMemo(() => 
    location.pathname.split('/')[1] === "admin" ? "/admin/" : "/student/", 
    [location.pathname]
  );

  const sidebarWidth = useMemo(() => 
    windowSize.width <= 768 ? '4rem'
    : windowSize.width <= 1536 ? "5rem"
    : "15rem",
    [windowSize.width]
  );

  // Handle logout
  const handleLogout = () => {
    removeAuthentication();
    removeStudentData();
    showToast("success", "Signed out successfully");
    navigate('/login'); // Redirect to login page or another appropriate page
  };

  return (
    <motion.aside
      initial={{ width: sidebarWidth }}
      animate={{ width: sidebarWidth }}
      whileHover={{ width: windowSize.width >= 768 ? "15rem" : '4rem' }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 40, 
        mass: 1,
      }}
      className="
        min-h-screen fixed z-50 top-0 left-0 bg-[#074873] text-neutral-light
        flex flex-col gap-4 p-2 md:p-3 lg:p-4
      "
      aria-label="Sidebar Navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-center w-full">
        <Link to={`${getLogoLink}dashboard`}>
          <motion.img
            src={logo}
            alt="PSITS Logo"
            className="w-10 h-10 md:w-12 md:h-12"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }} // Removed delay
          />
        </Link>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <motion.li
              key={item.path}
              className={`flex ${
                windowSize.width < 768 
                  ? 'justify-center' 
                  : isHovered 
                    ? 'justify-start' 
                    : 'justify-start'
              } items-center rounded-md transition-colors duration-300 ${
                currentPath === item.path ? 'bg-neutral-light text-dark' : 'hover:bg-neutral-medium hover:text-dark'
              }`}
              initial={{ opacity: 1 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }} // Removed delay
            >
              <Link
                to={`${getLogoLink}${item.path}`}
                className={`flex-1 flex items-center py-3 px-4 rounded-lg transition-colors duration-300 ${
                  currentPath === item.path ? 'bg-custom-active text-custom-active-text' : 'text-custom-text'
                }`}
                aria-current={currentPath === item.path ? "page" : undefined}
              >
                <i className={`fa ${item.icon} text-xl`} aria-hidden="true" />
                <motion.span
                  className={`ml-4 text-sm font-medium whitespace-nowrap ${
                    windowSize.width < 768 ? 'hidden' : windowSize.width > 1536 || isHovered ? 'block' : 'hidden'
                  }`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: (windowSize.width > 768 || isHovered) ? 1 : 0, x: 0 }}
                  transition={{ opacity: { duration: 0.3 }, x: { duration: 0.3 } }} // Removed delay
                >
                  {item.text}
                </motion.span>
              </Link>
            </motion.li>
          ))}
        </ul>
        <motion.button
          onClick={handleLogout}
          className="flex items-center mt-10 p-3 md:p-4 w-full  text-neutral-light"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }} // Removed delay
          aria-label="Logout"
        >
          <i className="fas fa-sign-out-alt text-lg" aria-hidden="true" />
          <motion.span
            className={`ml-4 text-sm font-medium whitespace-nowrap ${
              windowSize.width < 768 ? 'hidden' : windowSize.width > 1536 || isHovered ? 'block' : 'hidden'
            }`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: (windowSize.width > 768 || isHovered) ? 1 : 0, x: 0 }}
            transition={{ opacity: { duration: 0.3 }, x: { duration: 0.3 } }} // Removed delay
          >
            Logout
          </motion.span>
        </motion.button>
      </nav>
    </motion.aside>
  );
};

// Utility function to debounce events
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export default AsideBar;
