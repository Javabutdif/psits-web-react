import React from 'react';

const TableBody = ({ columns, currentRows }) => (
  <tbody className="bg-white divide-y divide-gray-200 max-h-[50vh] overflow-y-auto">
    {currentRows.length > 0 ? (
      currentRows.map((row, rowIndex) => (
        <tr key={`row-${row.id || rowIndex}`}>
          {columns.map((column, columnIndex) => (
            <td
              key={`cell-${row.id || rowIndex}-${column.key || columnIndex}`}
              className={`px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
            >
              {column.cell ? column.cell(row) : row[column.key] || ''}
            </td>
          ))}
        </tr>
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

export default TableBody;