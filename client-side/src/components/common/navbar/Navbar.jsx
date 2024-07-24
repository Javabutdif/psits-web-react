import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/psits-logo.png';
import HamburgerToggle from '../toogles/HamburgerToggle';

const navItems = [
  { name: 'Explore', path: '/explore', iconClass: 'fas fa-compass' },
  { name: 'Faculty', path: '/faculty', iconClass: 'fas fa-chalkboard-teacher' },
  { name: 'The Team', path: '/the-team', iconClass: 'fas fa-users' },
  { name: 'Login', path: '/login', iconClass: 'fas fa-sign-in-alt' }
];

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("none");
  const [isMobile, setMobile] = useState(true);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeToggleMenu = () => setMenuOpen(false);

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setMobile(true);
      closeToggleMenu();
    } else {
      setMobile(false);
    }
  };

  const handleScroll = () => {
    const currentPosition = window.scrollY;
    if (currentPosition > scrollPosition) {
      // Scrolling down
      setScrollDirection("down");
    } else {
      // Scrolling up
      setScrollDirection("up");
    }
    if (currentPosition === 0) {
      // Reset navbar to top position
      setNavbarVisible(true);
    }
    setScrollPosition(Math.max(currentPosition, 0));
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollPosition]);

  return (
    <motion.header 
      className={`z-40 w-full fixed  text-primary transition-transform duration-300 ${scrollDirection === "down" && scrollPosition > 5 ? "-translate-y-full" : ""} ${scrollDirection === "up" || scrollPosition <= 5 ? "translate-y-0" : ""}`}
    >
      <div className="max-w-[1320px] mx-auto px-2 md:px-4 py-1 rounded-b-2xl bg-primary flex justify-between items-center relative">
        <Link
          to="/" 
          className="z-50 flex items-center gap-2"
          onClick={closeToggleMenu}
        >
          <img src={logo} alt="header-logo" className="w-12" />
          <span className="text-[0.6rem] max-w-[13rem] sm:text-xs sm:max-w-xs font-bold">
            PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
          </span>
        </Link>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ clipPath: 'circle(0% at 100% 0)' }}
              animate={{ clipPath: 'circle(141.3% at 100% 0)' }}
              exit={{ clipPath: 'circle(0% at 100% 0)' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="z-30 absolute top-0 left-0 bg-white w-full min-h-screen"
            />
          )}
        </AnimatePresence>

        <HamburgerToggle isOpen={isMenuOpen} toggleMenu={toggleMenu} />

        <nav className={`absolute lg:static lg:flex z-40 top-1/2 w-full min-h-screen lg:min-h-0 left-0 lg:left-0 lg:-translate-x-0 lg:top-0 lg:-translate-y-0 lg:w-auto h-full lg:h-auto items-center justify-center ${isMenuOpen ? 'flex text-black text-3xl' : 'hidden text-white'}`}>
          <motion.ul
            className="space-y-6 text-md font-bold space-x-0 lg:space-y-0 md:space-x-2 lg:space-x-6 lg:flex"
          >
            {navItems.map((item, index) => (
              <motion.li
                key={index}
                initial={isMobile ? { opacity: 0, y: 20 } : {}}
                animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }} // Ensure default state for non-mobile
                exit={isMobile ? { opacity: 0, y: 20 } : {}}
                transition={{ duration: 0.3, delay: isMobile ? index * 0.1 : 0 }} // Apply delay only for mobile
                whileHover={{ scale: 1.1 }} // Add scale on hover
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className="md:text-left relative"
              >
                <Link 
                  to={item.path}
                  onClick={closeToggleMenu}
                  className="flex justify-between text-4xl lg:text-lg items-center gap-2"
                  aria-label={item.name}
                >
                  <motion.i
                    className={item.iconClass}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: hoveredItem === index ? 1 : 0, x: hoveredItem === index ? 0 : 10 }}
                    transition={{ opacity: { duration: 0.3 }, x: { duration: 0.3 } }}
                  />
                  <span className="">{item.name}</span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
