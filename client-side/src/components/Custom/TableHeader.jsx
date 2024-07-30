import React from 'react';

const TableHeader = ({ columns, sortConfig, handleSort }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column, columnIndex) => (
        <th
          key={`header-${column.key || columnIndex}`}
          className={`px-3 text-center md:text-start md:px-7 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          {column.label}
          {column.sortable && sortConfig.key === column.key && (
            <span>
              {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
            </span>
          )}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;