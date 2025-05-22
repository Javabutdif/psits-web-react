import { handleLogouts } from "../../../api/index";
import logo from "../../../assets/images/psits-logo.png";
import { removeAuthentication } from "../../../authentication/Authentication";
import { showToast } from "../../../utils/alertHelper";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";


const AsideBar = ({ navItems, isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null); // Ref to the sidebar
  const currentPath = location.pathname.split("/")[2];

  const getLogoLink =
    location.pathname.split("/")[1] === "admin" ? "/admin/" : "/student/";
  const handleLogout = () => {
    try {
      removeAuthentication();

      showToast("success", "Signed out successfully");

      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      showToast("error", "Error signing out");
    }
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSidebarOpen]);

  // Monitor screen size and handle sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsSidebarOpen]);

  return (
    <AnimatePresence>
      {(isSidebarOpen || window.innerWidth >= 1024) && (
        <motion.aside
          ref={sidebarRef}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            w-[15rem]
            fixed z-50 top-0 left-0 bg-[#074873] text-neutral-light
            h-full flex flex-col gap-4 p-4 overflow-hidden
            ${window.innerWidth < 1024 ? "block" : "hidden"} lg:block
          `}
          aria-label="Sidebar Navigation"
        >
          <div className="flex justify-between items-center pb-3">
            <Link to={`${getLogoLink}dashboard`}>
              <img
                src={logo}
                alt="PSITS Logo"
                className="w-10 h-10 md:w-12 md:h-12"
              />
            </Link>
            <button
              className={`text-white ${
                window.innerWidth < 1024 ? "block" : "hidden"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={`${getLogoLink}${item.path}`}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-300 ${
                      currentPath === item.path
                        ? "bg-neutral-light text-dark"
                        : "hover:bg-neutral-medium hover:text-dark"
                    }`}
                    aria-current={
                      currentPath === item.path ? "page" : undefined
                    }
                  >
                    <i
                      className={`fa ${item.icon} text-xl`}
                      aria-hidden="true"
                    />
                    <span className="ml-4 text-sm font-medium whitespace-nowrap">
                      {item.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center mt-10 p-3 md:p-4 w-full text-neutral-light hover:bg-neutral-medium hover:text-dark rounded-lg transition-colors duration-300"
            aria-label="Logout"
          >
            <i className="fas fa-sign-out-alt text-lg" aria-hidden="true" />
            <span className="ml-4 text-sm font-medium whitespace-nowrap">
              Logout
            </span>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default AsideBar;
