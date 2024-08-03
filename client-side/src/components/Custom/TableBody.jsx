import React from 'react';
import { motion } from 'framer-motion';

const TableBody = ({ columns, currentRows, loading }) => {
  // Define a minimalistic skeleton loader
  const SkeletonLoader = () => (
    <tr>
      {columns.map((column, columnIndex) => (
        <td
          key={`skeleton-${columnIndex}`}
          className={`px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
        >
          <motion.div
            className="bg-gray-200 rounded-md h-4 md:h-5"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: [0.6, 0.8, 0.6], scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'ease-in-out' }}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <tbody className="bg-white divide-y divide-gray-200 max-h-[50vh] overflow-y-auto">
      {loading ? (
        // Render skeleton loaders when data is loading
        Array.from({ length: 5 }).map((_, index) => (
          <SkeletonLoader key={`skeleton-${index}`} />
        ))
      ) : currentRows.length > 0 ? (
        currentRows.map((row, rowIndex) => (
          <motion.tr
            key={`row-${row.id || rowIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(0, 0, 0, 0.02)' }} // Subtle darken effect
            className="cursor-pointer"
          >
            {columns.map((column, columnIndex) => (
              <motion.td
                key={`cell-${row.id || rowIndex}-${column.key || columnIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
              >
                {column.cell ? column.cell(row) : row[column.key] || ''}
              </motion.td>
            ))}
          </motion.tr>
        ))
      ) : (
        <tr>
          <td colSpan={columns.length} className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default TableBody;
