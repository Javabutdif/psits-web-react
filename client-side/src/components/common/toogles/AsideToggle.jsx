import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AsideToggle = ({ onClick }) => {




  return (
      <motion.button
        initial={{ opacity: 0, scale: 1}}
        animate={{ opacity: 1}}
        whileHover={{ scale: 1.1, rotate: 45, backgroundColor: '#074873', boxShadow: '0px 0px 10px rgba(0,0,0,0.3)' }}
        whileTap={{ scale: 0.9 }}
        className="hidden sm:flex cursor-pointer absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#074873] rounded-full text-white shadow-md border-4 border-black flex items-center justify-center z-10"
        transition={{ duration: 0.3}}
        onClick={onClick}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </motion.button>
  );
};

export default AsideToggle;
