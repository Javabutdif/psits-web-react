import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/psits-logo.png";
import { showToast } from "../../utils/alertHelper";
import { removeAuthentication } from "../../authentication/localStorage";
import { removeStudentData } from "../../utils/editStudentData";
import AsideToggle from "./AsideToggle";

const navItems = [
  { text: "Dashboard", icon: "fas fa-tachometer-alt", url: "/admin-dashboard" },
  { text: "Membership", icon: "fas fa-users", url: "/membership-request" },
  { text: "Merchandise", icon: "fas fa-boxes", url: "/merchandise" },
  { text: "Inventory", icon: "fas fa-warehouse", url: "/inventory" },
  { text: "Orders", icon: "fas fa-shopping-cart", url: "/orders" },
  { text: "Analytics", icon: "fas fa-chart-line", url: "/analytics" },
  { text: "Resources", icon: "fas fa-book-open", url: "/resources" },
  { text: "Settings", icon: "fas fa-cog", url: "/settings" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    removeAuthentication("AuthenticationToken");
    showToast("success", "Signed out successfully");
    handleRemoveStudentData();
    navigate("/");
  };

  const handleRemoveStudentData = () => {
    removeStudentData();
  };

  const handleToggle = () => setMenuOpen(!menuOpen);
  const closeToggle = () => setMenuOpen(false); // Set menuOpen to false to close the menu

  return (

    <motion.aside
      initial={{ width: '8rem'}}
      animate={{ width: menuOpen ? '21rem' : '8rem' }}
      transition={{ duration: 0.5 }}
      className="bg-white relative border-black text-black min-h-screen p-4 py-8 flex flex-col items-center justify-between shadow-lg"
    >
      <Link to={"/admin/dashboard"}>
        <motion.img 
          initial={{ scale: 0}}
          animate={{ scale: 1}}
          transition={{ duration: 0.5 }}
          src={logo} alt="PSITS Logo" className="w-16" />
      </Link>


        <AsideToggle onClick={handleToggle} />


      <motion.nav className="mt-4 w-full flex justify-center">
        <ul className="space-y-5 sm:space-y-10">
          {navItems.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer text-center"
            >
              <Link to={`/admin/${item.text.toLowerCase()}`} className="flex items-center space-x-5 block">
                <motion.i 
                  className={`${item.icon} text-black text-2xl block mb-1`} />
                <motion.span 
                  initial={{ x: 23 }}
                  animate={{ x: menuOpen ? 0 : 23 }}
                  className={`text-lg text-black ${menuOpen ? 'block' : 'hidden'}`}>{item.text}</motion.span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.nav>


        <motion.button
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogoutClick}
          className={`text-black flex space-x-3 ${
            menuOpen ? "-ml-16" : "ml-0"
          } self-center pace-x-5`}
        >
          <i className={`text-2xl fas fa-sign-out-alt`}></i>
          <motion.span
            initial={{ x: 23 }}
            animate={{ x: menuOpen ? 0 : 23 }}
            className={`${menuOpen ? "block" : "hidden text-lg"}`}
          >
            Logout
          </motion.span>
        </motion.button>
      </motion.aside>
      {menuOpen && (
        <div
          className="bg-black bg-opacity-10 fixed z-10 h-screen w-screen"
          onClick={closeToggle}
        ></div>
      )}
    </div>
  );
}

export default Navbar;
