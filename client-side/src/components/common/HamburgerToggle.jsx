import React from 'react';
import { motion } from 'framer-motion';

const HamburgerToggle = ({ isOpen, toggleMenu }) => {
  const topLineVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 }
  };

  const middleLineVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 }
  };

  const bottomLineVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 }
  };

  return (
    <motion.button
      className={`block lg:hidden hamburger text-black ${isOpen ? 'open' : ''}`}

      initial={{ scale: 0}}
      animate={{ scale: 1}}

      onClick={toggleMenu}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      whileHover={{ scale: 1.1 }}
    >
      <motion.span
        className={`w-6 h-1  ${isOpen ? 'bg-black' : 'bg-white'}`}
        animate={isOpen ? 'open' : 'closed'}
        variants={topLineVariants}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className={`w-6 h-1  ${isOpen ? 'bg-black' : 'bg-white'}`}
        animate={isOpen ? 'open' : 'closed'}
        variants={middleLineVariants}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className={`w-6 h-1  ${isOpen ? 'bg-black' : 'bg-white'}`}
        animate={isOpen ? 'open' : 'closed'}
        variants={bottomLineVariants}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default HamburgerToggle;
