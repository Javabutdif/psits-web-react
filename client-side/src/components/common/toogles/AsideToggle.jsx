import React from 'react';
import { motion } from 'framer-motion';

const AsideToggle = ({ onClick, menuOpen }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      className="hidden sm:flex cursor-pointer absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#074873] rounded-full shadow-md border-2 border-primary flex items-center justify-center z-10"
      transition={{ duration: 0.3 }}
      onClick={onClick}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
    >
      <i className={`text-white fas ${menuOpen ? 'fa-arrow-left' : 'fa-arrow-right'}`} />
    </motion.button>
  );
};


export default AsideToggle;
