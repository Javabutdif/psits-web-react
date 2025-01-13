import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/images/psits-logo.png";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Event", path: "/event", iconClass: "fas fa-calendar" },
  { name: "Community", path: "/community", iconClass: "fas fa-users" },
  {
    name: "Login",
    path: "/login",
    iconClass: "fas fa-sign-in-alt",
    isLogin: true,
  },
];

const Navbar = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const windowHeight = window.innerHeight;

      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setShowBackdrop(currentScrollPos > windowHeight * 0.1);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const toggleBodyScroll = (disable) => {
    document.body.style.overflow = disable ? "hidden" : "";
  };

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
    toggleBodyScroll(!isNavOpen);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const NavItems = ({ isMobile }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
      <ul
        className={`flex-1 pt-4 md:pt-0 flex ${
          isMobile
            ? "flex-col items-end space-y-4"
            : "flex-row items-center space-x-8"
        }`}
      >
        {navItems.map((item, key) => (
          <li
            key={key}
            className={`relative ${item.isLogin ? "md:ml-auto" : ""}`}
            onClick={() => {
              setIsNavOpen(false);
              toggleBodyScroll(false);
            }}
            onMouseEnter={() => setHoveredIndex(key)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link
              to={item.path}
              className={`text-3xl md:text-sm flex items-center space-x-2 ${
                showBackdrop ? "text-black" : "text-white"
              } ${location.pathname === item.path ? "text-gray-700" : ""} ${
                isNavOpen ? "text-gray-700 hover:text-gray-600" : ""
              } transition-colors duration-300`}
              aria-current={item.isLogin ? "page" : undefined}
            >
              <motion.i
                initial={{ opacity: 0.6 }}
                animate={{ opacity: hoveredIndex === key ? 1 : 0.6 }}
                transition={{ type: "spring", stiffness: 1000, damping: 30 }}
                className={`${item.iconClass} text-xl md:text-lg`}
              />
              <span className="text-xl md:text-sm font-medium">
                {item.name}
              </span>
            </Link>
            {hoveredIndex === key && (
              <motion.div
                className={`absolute left-0 -bottom-2 w-full h-1 bg-dark rounded-t-md`}
                layoutId="underline"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ type: "spring", stiffness: 1000, damping: 30 }}
              />
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <header
      className={`z-50 pb-0 px-4 fixed left-1/2 -translate-x-1/2 container p-4 py-3 md:py-5 flex items-center justify-between transition-transform duration-300 ${
        !isVisible && "transform -translate-y-full"
      }`}
    >
      {showBackdrop && (
        <div className="-z-10 fixed top-0 left-0 w-full h-16 md:h-20 backdrop-blur-xl transition-opacity duration-300" />
      )}
      <Link
        to="/"
        className={`space-x-2 flex ${
          showBackdrop ? "text-black" : "text-neutral-light"
        } items-center`}
      >
        <img src={logo} alt="PSITS Logo" className="w-11 h-11" />
        <h1 className="hidden md:inline-block text-xs font-bold w-[15.5rem]">
          PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
        </h1>
      </Link>
      <button
        className="z-50 block md:hidden text-white"
        onClick={toggleNav}
        aria-label={
          isNavOpen ? "Close navigation menu" : "Open navigation menu"
        }
      >
        <i
          className={`${
            showBackdrop ? "text-gray-700" : "text-neutral-light"
          } fas ${isNavOpen ? "fa-times" : "fa-bars"} text-lg`}
        ></i>
      </button>
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-primary via-secondary to-secondary flex justify-end items-start px-5 py-14 absolute w-full h-screen top-0 right-0 md:hidden"
          >
            <NavItems isMobile={true} />
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="hidden md:flex">
        <NavItems isMobile={false} />
      </nav>
    </header>
  );
};

export default Navbar;
