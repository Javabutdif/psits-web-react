import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../../assets/images/psits-logo.png";
import HamburgerToggle from "../toogles/HamburgerToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("none"); // "up", "down", "none"

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  };

  const handleScroll = () => {
    const currentPosition = window.scrollY;

    if (currentPosition > scrollPosition) {
      setScrollDirection("down");
    } else if (currentPosition < scrollPosition) {
      setScrollDirection("up");
    }

    setScrollPosition(currentPosition <= 0 ? 0 : currentPosition);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollPosition]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden"); // Add no-scroll class to body
    } else {
      document.body.classList.remove("overflow-auto"); // Remove no-scroll class from body
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const menuVariants = {
    open: {
      transition: { staggerChildren: 1, delayChildren: 1.5 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -0.5 },
    },
  };

  return (
    <header
      className={`fixed w-full z-50 py-2 ${
        isMenuOpen ? "text-black" : "text-white"
      }  ${
        scrollPosition > 5
          ? "bg-primary transition-all duration-500"
          : "bg-transparent"
      } ${
        scrollDirection === "down" && scrollPosition > 5 ? "-translate-y-full" : ""
      } ${
        scrollDirection === "up" || scrollPosition <= 5 ? "translate-y-0" : ""
      }`}
    >
      <div className="container px-2  mx-auto flex justify-between items-center gap-1">
        <Link
          to="/"
          onClick={closeMenu}
          className="relative flex items-center z-40"
        >
          <motion.img
            src={logo}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            alt="psits logo"
            className="w-14 h-auto mr-2"
          />
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={` sm:block text-xs  font-bold max-w-[300px] `}
          >
            PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
          </motion.h3>
        </Link>

        <div className="relative z-40 lg:hidden">
          <HamburgerToggle isOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>

        <nav
          className={`navbar absolute top-0 left-0 lg:py-0 z-30 w-full lg:relative lg:w-auto lg:left-auto lg:top-auto lg:min-h-0 lg:flex lg:space-x-4 ${
            isMenuOpen ? "nav-open" : ""
          }`}
        >
          <motion.div
            initial={
              isMenuOpen
                ? { clipPath: "circle(0.3% at 100% 0)" }
                : { clipPath: "circle(0% at 100% 0)" }
            }
            animate={
              isMenuOpen
                ? { clipPath: "circle(141.3% at 100% 0)" }
                : { clipPath: "circle(0% at 100% 0)" }
            }
            exit={{ clipPath: "circle(0.3% at 100% 0)" }}
            transition={{ duration: 0.3 }}
            className={`w-full h-screen bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-opacity duration-500 `}
            style={{
              clipPath: isMenuOpen
                ? "circle(0.3% at 100% 0)"
                : "circle(0% at 100% 0)",
            }}
          />
          <motion.ul
            className={`flex flex-col text-4xl sm:text-md ${
              isMenuOpen ? "font-bold" : "font-light"
            } space-y-10 lg:text-base lg:space-y-0 lg:space-x-16 lg:flex-row items-center lg:items-start justify-center min-h-screen lg:min-h-0 ${
              isMenuOpen ? "block text-black" : "hidden lg:flex text-white"
            }`}
            variants={menuVariants}
            initial="closed"
            animate={isMenuOpen ? "open" : "closed"}
          >
            {["Explore", "Faculty", "The Team", "Login"].map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  open: {
                    opacity: 1,
                    y: window.innerWidth >= 768 ? 0 : undefined,
                    x: window.innerWidth < 768 ? 0 : undefined,
                  },
                  closed: {
                    opacity: 0,
                    y: window.innerWidth >= 768 ? 0 : -20,
                    x: window.innerWidth < 768 ? 0 : -20,
                  },
                }}
                initial="closed"
                animate={
                  isMenuOpen || window.innerWidth >= 768 ? "open" : "closed"
                }
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3, delay: index * 0.2 }}
              >
                <Link
                  to={`/${item.toLowerCase().replace(" ", "-")}`}
                  onClick={closeMenu}
                >
                  {item}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
