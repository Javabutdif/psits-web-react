import React from 'react';

const Pagination = ({ currentPage, totalPages, handlePageChange }) => (
  <div className="flex justify-between items-center py-2 px-4">
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
    >
      Previous
    </button>
    <span>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default Pagination;