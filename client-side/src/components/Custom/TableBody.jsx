import React from 'react';
import { motion } from 'framer-motion';

const TableBody = ({ columns, currentRows, loading }) => {
  const SkeletonLoader = () => (
    <tr className="hidden md:table-row">
      {columns.map((column, columnIndex) => (
        <td
          key={`skeleton-${columnIndex}`}
          className={`p-2 md:p-3 text-left ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''} ${column.width || 'w-auto'}`}
        >
          <motion.div
            className="bg-neutral-medium rounded-md h-3"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 0.8, 0.6], scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </td>
      ))}
    </tr>
  );

  const MobileSkeletonLoader = () => (
    <div className="p-4 bg-neutral-light rounded-md mb-4">
      {columns.map((_, index) => (
        <div key={`skeleton-mobile-${index}`} className="flex justify-between py-2">
          <div className="h-3 w-3/4 bg-neutral-medium rounded-md" />
          <div className="h-3 w-1/4 bg-neutral-medium rounded-md" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Table View */}
      <tbody className="hidden md:table-row-group">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
        ) : currentRows.length > 0 ? (
          currentRows.map((row, rowIndex) => (
            <motion.tr
              key={row.id || rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="hover:bg-neutral-light cursor-pointer"
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={`cell-${row.id || rowIndex}-${column.key || columnIndex}`}
                  className={`p-2 md:p-3 text-left text-xs md:text-sm font-medium text-neutral-dark ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''} ${column.width || 'w-auto'}`}
                >
                  {column.cell ? column.cell(row) : row[column.key] || ''}
                </td>
              ))}
            </motion.tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="p-3 text-center text-neutral-dark text-xs md:text-sm">
              No data available
            </td>
          </tr>
        )}
      </tbody>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <MobileSkeletonLoader key={index} />)
        ) : currentRows.length > 0 ? (
          currentRows.map((row, rowIndex) => (
            <motion.div
              key={`row-mobile-${row.id || rowIndex}`}
              className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Top Section: Select and Actions */}
              <div className="flex justify-between items-center mb-3 border-b pb-2 border-gray-200">
                {columns.map((column, columnIndex) =>
                  column.key === 'select' || column.key === 'actions' ? (
                    <div key={`cell-mobile-top-${row.id || rowIndex}-${column.key || columnIndex}`} className="flex items-center">
                      {column.cell ? column.cell(row) : row[column.key] || ''}
                    </div>
                  ) : null
                )}
              </div>

              {/* Bottom Section: Rest of the Data */}
              <div className="space-y-2">
                {columns.map((column, columnIndex) =>
                  column.key !== 'select' && column.key !== 'actions' ? (
                    <div
                      key={`cell-mobile-bottom-${row.id || rowIndex}-${column.key || columnIndex}`}
                      className="flex justify-between py-1 text-sm text-neutral-dark"
                    >
                      <span className="font-medium">{column.cell ? column.cell(row) : row[column.key] || ''}</span>
                    </div>
                  ) : null
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-neutral-dark text-sm">
            No data available
          </div>
        )}
      </div>
    </>
  );
};

export default TableBody;
