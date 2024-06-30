import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../assets/images/psits-logo.png';
import HamburgerToggle from './HamburgerToggle';

const NavbarLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  };

  const handleScroll = () => {
    setScrollPosition(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Framer Motion variants for hover effect
  const linkVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <header className={`fixed w-full z-50 py-4 text-white font-montserrat ${scrollPosition > 100 ? 'backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="container px-2 mx-auto flex justify-between items-center">
        <Link to={'/'} className="relative flex items-center z-40">
          <img src={logo} alt="psits logo" className="w-16 h-auto mr-2" />
          <h3 className="text-sm font-bold max-w-[300px]">
            PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
          </h3>
        </Link>

        {/* Hamburger Menu Toggle (for mobile) */}
        <div className="relative z-40 lg:hidden">
          <HamburgerToggle isOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>

        {/* Navigation Menu (responsive) */}
        <nav className={`navbar absolute top-0 left-0 lg:py-0 z-30 w-full lg:relative lg:w-auto lg:left-auto lg:top-auto lg:min-h-0 lg:flex lg:space-x-4 ${isMenuOpen ? 'nav-open' : ''}`}>
          {/* Circular clip-path overlay */}
          <div className={`backdrop-blur-2xl bg-black nav-mask lg:hidden ${isMenuOpen ? 'nav-mask-open' : ''}`} />

          {/* Navigation links */}
          <ul className={`flex flex-col text-4xl space-y-9 -mt-5 lg:mt-0 lg:text-lg justify-center min-h-screen items-center lg:min-h-0 lg:space-y-0 lg:items-start lg:flex-row space-y-6 lg:space-x-9 ${isMenuOpen ? 'block' : 'hidden lg:flex'}`}>
            <motion.li variants={linkVariants} whileHover="hover">
              <Link to="/explore" onClick={closeMenu}>Explore</Link>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <Link to="/faculty" onClick={closeMenu}>Faculty</Link>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <Link to="/the-team" onClick={closeMenu}>The Team</Link>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <Link to="/login" onClick={closeMenu}>Login</Link>
            </motion.li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavbarLanding;
