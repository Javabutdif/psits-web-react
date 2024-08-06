import React, { useState, useMemo, useEffect } from 'react';
import SearchComponent from './SearchComponent';
import ButtonsComponent from './ButtonsComponent';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

const TableComponent = ({ data = [], columns = [], style, customSearch, customButtons }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const getColumnValue = (item, key) => {
    if (key === 'name') {
      return `${item.first_name} ${item.middle_name} ${item.last_name} RFID: ${item.rfid}`;
    }
    return item[key];
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = getColumnValue(a, sortConfig.key);
      const bValue = getColumnValue(b, sortConfig.key);
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const filteredDataBySearch = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return sortedData.filter((item) =>
      columns.some((column) => {
        const value = getColumnValue(item, column.key);
        return value && value.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [sortedData, searchQuery, columns]);

  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = filteredDataBySearch.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredDataBySearch.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto overflow-hidden">
      <div className="bg-white mt-2 rounded-sm p-3 flex flex-row gap-3 shadow-sm">
        {customSearch || <SearchComponent searchQuery={searchQuery} handleSearchChange={handleSearchChange} />}
        {customButtons || <ButtonsComponent />}
      </div>
      <div className={`w-full h-[35vh] sm:h-[60vh] md:h-[70vh] overflow-hidden bg-white ${style} overflow-scroll relative`}>
        <table aria-label="Data Table" role="table" className="absolute lg:min-w-full divide-y divide-gray-200">
          <TableHeader columns={columns} sortConfig={sortConfig} handleSort={handleSort} />
          <TableBody columns={columns} currentRows={currentRows} />
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default TableComponent;
