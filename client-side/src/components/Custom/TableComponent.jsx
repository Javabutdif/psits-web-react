import React, { useState, useMemo } from 'react';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';

const TableComponent = ({ data = [], columns = [], style, pageType, handleExportPDF, handleRenewal, otherButton }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Limiting rows per page to 5
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const filteredDataBySearch = useMemo(() => {
    return sortedData.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return columns.some((column) => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    });
  }, [sortedData, searchQuery, columns]);

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

  // Export PDF handler
  const handleExportPDFClick = () => {
    handleExportPDF(filteredDataBySearch);
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
            onClick={handleExportPDFClick}
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
          {otherButton}
        </div>
      </div>
      <div className={`w-full h-[220px] bg-white ${style}relative overflow-x-auto`}>
        <table className="absolute lg:min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
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
          <tbody className="bg-white divide-y divide-gray-200 max-h-[50vh] overflow-y-auto">
            {currentRows.length > 0 ? (
              currentRows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}> {/* Use a unique identifier like row.id if available */}
                  {columns.map((column) => (
                    <td
                      key={`${row.id || rowIndex}-${column.key}`} // Ensure unique keys for each cell
                      className={`px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {column.cell ? column.cell(row) : row[column.key]}
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
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 md:space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-left md:hidden"></i>
          <span className="hidden md:inline">Previous</span>
        </button>
        <div className="text-xs md:text-sm lg:text-base text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-right md:hidden"></i>
          <span className="hidden md:inline">Next</span>
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
