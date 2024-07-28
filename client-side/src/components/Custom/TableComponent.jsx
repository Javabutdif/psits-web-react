import React, { useState, useMemo } from 'react';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';

const TableComponent = ({ data = [], columns = [], pageType, handleExportPDF, handleRenewal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Limiting rows per page to 10
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDataBySearch = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return columns.some((column) => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchQuery, columns]);
  // Calculate the index range for the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredDataBySearch.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate total pages
  const totalPages = Math.ceil(filteredDataBySearch.length / rowsPerPage);

  // Change page handler
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Sort handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Search handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  return (
    <div className="overflow-x-auto">
      <div className="bg-white p-4 flex flex-col gap-4 md:flex-row md:gap-6 shadow-sm">
        {/* Form Input */}
        <FormInput
          label="Search"
          type="text"
          id="id-number"
          name="id_number"
          value={searchQuery}
          onChange={handleSearchChange}
          styles="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search by ID number"
        />

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <FormButton
            type="button"
            text="Export to PDF"
            onClick={handleExportPDF}
            icon={<i className="fas fa-file-pdf text-xl"></i>}
            styles="w-full md:w-auto bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 rounded-sm p-2 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
          />
          <FormButton
            type="button"
            text="Renew All Students"
            onClick={handleRenewal}
            icon={<i className="fas fa-check text-xl"></i>}
            styles={`${pageType !== 'members' ? 'hidden' : 'block'} w-full md:w-auto bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 rounded-sm p-2 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2`}
            disabled={pageType !== 'members'} // Disable button based on pageType
          />
        </div>
      </div>

      <div className=" overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
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
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.length > 0 ? (
              currentRows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}> {/* Use a unique identifier like row.id if available */}
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column.key}`} // Ensure unique keys for each cell
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {column.cell ? column.cell(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <div className="mt-2 md:mt-0">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
