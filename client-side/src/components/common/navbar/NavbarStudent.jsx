import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { showToast } from "../../../utils/alertHelper";
import { removeAuthentication } from "../../../authentication/Authentication";
import { removeStudentData } from "../../../utils/editStudentData";
import AsideToggle from "../toogles/AsideToggle";

const navItems = [
  { text: "Dashboard", icon: "fas fa-tachometer-alt" },
  { text: "Shop", icon: "fas fa-store" },
  { text: "Resources", icon: "fas fa-boxes" },
  { text: "History", icon: "fas fa-history" },
  { text: "Orders", icon: "fas fa-shopping-cart" },
  { text: "Settings", icon: "fas fa-cog" }
];

function Navbar() {
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
        className={`z-30 bg-primary fixed border-black text-primary min-h-screen py-8 flex flex-col items-center justify-between gap-10 shadow-lg ${
          menuOpen ? "w-64" : "w-20"
        } transition-width duration-300 ease-out`}
      >
        <Link to={"/student/dashboard"} className="self-center" onClick={handleCloseToggle}>
          <img
            src={logo}
            alt="PSITS Logo"
            className="w-14 transition-transform duration-500 transform scale-100"
          />
        </Link>

        <AsideToggle onClick={handleToggle} menuOpen={menuOpen} />
        
        <nav className="flex-1 self-stretch mt-4 w-full flex flex-col gap-10">
          <ul className="space-y-6 md:space-y-7 2xl:space-y-10 mb-auto">
            {navItems.map((item, index) => {
              const isActive = location.pathname === `/student/${item.text.toLowerCase()}`;
              return (
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={index}
                  onClick={handleCloseToggle}
                  className={`relative cursor-pointer text-center transition-opacity duration-200 ${isActive ? 'font-bold' : ''}`}
                >
                  <Link
                    to={`/student/${item.text.toLowerCase()}`}
                    className={`flex ${!menuOpen ? 'justify-center' : 'ml-14 justify-stretch'} ${isActive ? 'text-black' : 'text-primary'} items-center space-x-5`}
                  >
                    <i className={`${item.icon} text-2xl block mb-1`} />
                    <motion.span
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -40 }}
                      transition={{ duration: 0.2 }}
                      className={`left-16 text-lg ${menuOpen ? "block" : "hidden"} transition-all duration-500 ${isActive ? 'text-black' : ''}`}
                    >
                      {item.text}
                    </motion.span>
                    <span className={`absolute -z-10 -top-2 py-5 pl-5 rounded-l-full -left-[0.70rem] ${isActive ? 'bg-secondary' : ''} ${menuOpen ? 'w-[91.9%] -left-[0rem]' : 'w-[89%]'}`} />
                  </Link>
                </motion.li>
              );
            })}
          </ul>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogoutClick}
            className={`flex space-x-3 ${
              menuOpen ? "-ml-[3rem]" : "-ml-1"
            } self-center space-x-5 transition-transform duration-500`}
          >
            <i className="text-2xl fas fa-sign-out-alt"></i>
            <motion.span
              initial={{ opacity: 1, x: -40 }}
              animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -40 }}
              transition={{ duration: 0.2 }}
              className={`${menuOpen ? "block" : "hidden"} text-lg transition-all duration-500`}
            >
              Logout
            </motion.span>
          </motion.button>
        </nav>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={handleCloseToggle}
        />
      )}
    </>
  );
}

export default Navbar;
