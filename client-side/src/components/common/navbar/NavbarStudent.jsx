import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { showToast } from "../../../utils/alertHelper";
import { removeAuthentication } from "../../../authentication/Authentication";
import { removeStudentData } from "../../../utils/editStudentData";
import AsideToggle from "../toogles/AsideToggle";

const navItems = [
  { text: "Dashboard", icon: "fas fa-tachometer-alt", path: "/student/dashboard" },
  { text: "Merchandise", icon: "fas fa-boxes", path: "/student/merchandise" },
  { text: "Resources", icon: "fas fa-book-open", path: "/student/resources" },
  { text: "Orders", icon: "fas fa-shopping-cart", path: "/student/orders" },
  { text: "Settings", icon: "fas fa-cog", path: "/student/settings" }
];

function NavbarStudent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    removeAuthentication("AuthenticationToken");
    showToast("success", "Signed out successfully");
    handleRemoveStudentData();
    navigate("/login");
  };

  const handleRemoveStudentData = () => {
    removeStudentData();
  };

  const handleToggle = () => setMenuOpen(!menuOpen);
  const handleCloseToggle = () => setMenuOpen(false);

  return (
    <>
      <aside
        className={`z-50 bg-[#002E48] fixed border-black text-primary min-h-screen py-8 flex flex-col items-center gap-2 md:gap:gap-4 lg:gap-6 shadow-lg ${
          menuOpen ? "w-64" : "w-16 sm:w-20"
        } transition-width duration-300 ease-out`}
      >
        <Link to={"/student/dashboard"} className="self-center" onClick={handleCloseToggle}>
          <img
            src={logo}
            alt="PSITS Logo"
            className="w-10 md:w-14 transition-transform duration-500 transform scale-100"
          />
        </Link>

        <AsideToggle onClick={handleToggle} menuOpen={menuOpen} />

        <nav className="mt-4 w-full flex flex-col gap-10">
          <ul className="space-y-6 md:space-y-5 2xl:space-y-7 mb-auto">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li
                  key={index}
                  onClick={handleCloseToggle}
                  className={`relative cursor-pointer text-center transition-opacity duration-200 ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  <Link
                    to={item.path}
                    className={`flex ${
                      !menuOpen ? "justify-center" : "ml-14 justify-stretch"
                    } ${
                      isActive ? "text-black" : "text-primary"
                    } items-center space-x-2 sm:space-x-3 md:space-x-5`}
                  >
                    <i
                      className={`${item.icon} text-lg sm:text-xl md:text-2xl block mb-1`}
                    />
                    <motion.span
                       initial={{ opacity: 0, x: -40 }}
                       animate={{
                         opacity: menuOpen ? 1 : 0,
                         x: menuOpen ? 0 : -40,
                       }}
                       transition={{ duration: 0.2 }}
                       className={`left-16 text-xs sm:text-sm md:text-lg ${
                         menuOpen ? "block" : "hidden"
                       } transition-all duration-500 ${
                         isActive ? "text-black" : ""
                       }`}
                    >
                      {item.text}
                    </motion.span>
                    <span className={`absolute -z-10 sm:-top-1 py-4 rounded-l-full w-[96.4%] sm:w-[95.2%] md:w-[91.9%] sm:py-4 left-0 ${
                        isActive ? "bg-secondary" : ""
                      } `} />
                  </Link>
                </motion.li>
              );
            })}
          </ul>
          <motion.button
            onClick={handleLogoutClick}
            className={`relative cursor-pointer mt-10 transition-opacity duration-200`}
          >
            <i className="text-xl md:text-2xl fas fa-sign-out-alt"></i>
            <motion.span
              initial={{ opacity: 1, x: -40 }}
              animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -40 }}
              transition={{ duration: 0.2 }}
              className={`${menuOpen ? "block" : "hidden"} text-sm md:text-lg transition-all duration-500`}
            >
              Logout
            </motion.span>
          </motion.button>
        </nav>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={handleCloseToggle}
        />
      )}
    </>
  );
}

export default NavbarStudent;
