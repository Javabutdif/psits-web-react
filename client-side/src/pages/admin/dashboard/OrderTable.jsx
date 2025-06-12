import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { InfinitySpin } from "react-loader-spinner";
import { motion, AnimatePresence } from "framer-motion";

const OrderTable = ({
  data: initialData,
  total,
  page: initialPage,
  limit: initialLimit,
  onPageChange,
  onSortChange,
  onSearch,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState([]);
  const [page, setPage] = useState(initialPage || 1);
  const [limit, setLimit] = useState(initialLimit || 10);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSort = (field) => {
    let newSortConfig = [...sortConfig];
    const existingSortIndex = newSortConfig.findIndex(
      (sort) => sort.field === field
    );

    if (existingSortIndex >= 0) {
      // Cycle through sort states: asc -> desc -> none
      const existingSort = newSortConfig[existingSortIndex];
      if (existingSort.direction === "asc") {
        newSortConfig[existingSortIndex] = {
          ...existingSort,
          direction: "desc",
        };
      } else {
        // Remove this sort if cycling from desc
        newSortConfig.splice(existingSortIndex, 1);
      }
    } else {
      // Add new sort
      newSortConfig.push({ field, direction: "asc" });
    }

    setSortConfig(newSortConfig);
    if (onSortChange) {
      onSortChange(newSortConfig);
    }
  };

  const resetSort = () => {
    setSortConfig([]);
    if (onSortChange) {
      onSortChange([]);
    }
  };

  const getSortIcon = (field) => {
    const sortItem = sortConfig.find((sort) => sort.field === field);
    if (!sortItem) return faSort;
    return sortItem.direction === "asc" ? faSortUp : faSortDown;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage, limit);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
    if (onPageChange) {
      onPageChange(1, newLimit);
    }
  };

  const getYearSuffix = (year) => {
    if (year === 1) return "1st";
    if (year === 2) return "2nd";
    if (year === 3) return "3rd";
    return `${year}th`;
  };

  const totalPages = Math.ceil(total / limit);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const cellVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
    >
      {/* Search and Controls */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="absolute right-0 bg-blue-500 h-full text-white px-3 py-1 rounded-none rounded-tr rounded-br hover:bg-blue-600 transition-colors"
            onClick={() => onSearch(searchTerm)}
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSort}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
            title="Reset sort"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
            <span className="hidden sm:inline">Reset Sort</span>
          </button>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <th
                className="p-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("product_name")}
              >
                <div className="flex items-center gap-1">
                  <span>Order Name</span>
                  <FontAwesomeIcon icon={getSortIcon("product_name")} />
                </div>
              </th>
              <th
                className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Quantity</span>
                  <FontAwesomeIcon icon={getSortIcon("total")} />
                </div>
              </th>
              {initialData && initialData.length > 0 ? (
                initialData[0].yearCounts.map((_, index) => (
                  <th
                    key={index}
                    className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort(`year_${index + 1}`)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{`${getYearSuffix(index + 1)} Year`}</span>
                      <FontAwesomeIcon
                        icon={getSortIcon(`year_${index + 1}`)}
                      />
                    </div>
                  </th>
                ))
              ) : (
                <>
                  <th
                    className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year_1")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>1st Year</span>
                      <FontAwesomeIcon icon={getSortIcon("year_1")} />
                    </div>
                  </th>
                  <th
                    className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year_2")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>2nd Year</span>
                      <FontAwesomeIcon icon={getSortIcon("year_2")} />
                    </div>
                  </th>
                  <th
                    className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year_3")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>3rd Year</span>
                      <FontAwesomeIcon icon={getSortIcon("year_3")} />
                    </div>
                  </th>
                  <th
                    className="p-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year_4")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>4th Year</span>
                      <FontAwesomeIcon icon={getSortIcon("year_4")} />
                    </div>
                  </th>
                </>
              )}
            </motion.tr>
          </thead>

          {/* tbody with conditional rendering based on data */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <InfinitySpin width="200" color="#3B82F6" />
                  </motion.div>
                </td>
              </tr>
            ) : initialData && initialData.length > 0 ? (
              <AnimatePresence initial={false}>
                {initialData.map((order, rowIndex) => (
                  <motion.tr
                    key={order.product_name + rowIndex}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="border-b hover:bg-blue-50"
                  >
                    <motion.td
                      custom={0}
                      variants={cellVariants}
                      className="p-3 text-left font-medium text-gray-800"
                    >
                      {order.product_name}
                    </motion.td>

                    <motion.td
                      custom={1}
                      variants={cellVariants}
                      className="p-3 text-center"
                    >
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold inline-block"
                      >
                        {order.total}
                      </motion.span>
                    </motion.td>

                    {order.yearCounts.map((year, cellIndex) => (
                      <motion.td
                        key={cellIndex}
                        custom={cellIndex + 2}
                        variants={cellVariants}
                        className="p-3 text-center"
                      >
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (cellIndex + 2) * 0.05 }}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold inline-block"
                        >
                          {year}
                        </motion.span>
                      </motion.td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No pending orders found
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg border ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 transition-colors"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-lg border ${
                  page === pageNum
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-gray-100 transition-colors"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && page < totalPages - 2 && (
            <span className="px-2">...</span>
          )}

          {totalPages > 5 && page < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 transition-colors"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-lg border ${
              page === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 transition-colors"
            }`}
          >
            Next
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderTable;
