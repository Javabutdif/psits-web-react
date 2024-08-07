import React from 'react';
import { motion } from 'framer-motion';

const Pagination = ({ currentPage, totalPages, handlePageChange }) => (
  <div className="self-end flex items-center justify-center space-x-4 py-4">
    <motion.button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 ${
        currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white shadow-md'
      } transition-transform duration-300 ease-in-out`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <i className="fas fa-chevron-left"></i>
    </motion.button>
    <motion.span
      className="text-gray-600 font-medium"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {currentPage} / {totalPages}
    </motion.span>
    <motion.button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 ${
        currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white shadow-md'
      } transition-transform duration-300 ease-in-out`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <i className="fas fa-chevron-right"></i>
    </motion.button>
  </div>
);

export default Pagination;
