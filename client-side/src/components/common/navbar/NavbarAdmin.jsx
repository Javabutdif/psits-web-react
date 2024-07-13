import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { showToast } from "../../../utils/alertHelper";
import { removeAuthentication } from "../../../authentication/Authentication";
import { removeStudentData } from "../../../utils/editStudentData";
import AsideToggle from "../toogles/AsideToggle";

const navItems = [
  { text: "Dashboard", icon: "fas fa-tachometer-alt" },
  { text: "Membership", icon: "fas fa-users" },
  { text: "Merchandise", icon: "fas fa-boxes" },
  { text: "Inventory", icon: "fas fa-warehouse" },
  { text: "Orders", icon: "fas fa-shopping-cart" },
  { text: "Analytics", icon: "fas fa-chart-line" },
  { text: "Resources", icon: "fas fa-book-open" },
  { text: "Settings", icon: "fas fa-cog" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
        className={`z-30 bg-white fixed border-black text-black min-h-screen py-8 flex flex-col items-center justify-between gap-10 shadow-lg ${
          menuOpen ? "w-64" : "w-20"
        } transition-width duration-500`}
      >
        <Link to={"/admin/dashboard"} onClick={handleCloseToggle}>
          <img
            src={logo}
            alt="PSITS Logo"
            className="w-14 transition-transform duration-500 transform scale-100"
          />
        </Link>

        <AsideToggle onClick={handleToggle} />
        
        <nav className={`flex-1 mt-4 w-full flex flex-col ${menuOpen ? "items-stretch" : "items-center"} gap-10`}>
          <ul className="space-y-5 sm:space-y-10 my-auto">
            {navItems.map((item, index) => (
              <motion.li
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={index}
                onClick={handleCloseToggle}
                className="relative cursor-pointer text-center transition-opacity duration-200"
              >
                <Link
                  to={`/admin/${item.text.toLowerCase()}`}
                  className={`${menuOpen ? 'ml-12' : 'ml-0'} flex items-center space-x-5 block`}
                >
                  <i className={`${item.icon} text-black text-2xl block mb-1`} />
                  <motion.span
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : 5 }}
                    transition={{ duration: 0.01 }}
                    className={` left-16 text-lg text-black ${
                      menuOpen ? "block" : "hidden"
                    } transition-all duration-500`}
                  >
                    {item.text}
                  </motion.span>
                </Link>
              </motion.li>
            ))}
          </ul>
          <button
            onClick={handleLogoutClick}
            className={`text-black flex space-x-3 ${
              menuOpen ? "-ml-16" : "ml-0"
            } self-center space-x-5 transition-transform duration-500`}
          >
            <i className="text-2xl fas fa-sign-out-alt"></i>
            <span
              className={`${menuOpen ? "block" : "hidden"} text-lg transition-all duration-500`}
            >
              Logout
            </span>
          </button>
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
