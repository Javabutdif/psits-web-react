import React from 'react';
import { motion } from 'framer-motion';

const TableHeader = ({ columns, sortConfig, handleSort }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column, columnIndex) => (
        <motion.th
          key={`header-${column.key || columnIndex}`}
          className={`p-2 md:p-4 text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer 
                      ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
          onClick={() => column.sortable && handleSort(column.key)}
          whileHover={{ scale: 1.02, color: "#1f2937" }} // Slight scale and color change
          transition={{ duration: 0.15 }}
        >
          {column.label}
          {column.sortable && sortConfig.key === column.key && (
            <span className="text-xs text-gray-400 ml-1">
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </motion.th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
