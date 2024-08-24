// components/Custom/SearchFilter.js
import React from 'react';
import SearchComponent from '../../../components/Custom/SearchComponent';

const SearchFilter = ({ searchQuery, handleSearchChange, customButtons }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-2">
      <SearchComponent 
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange} // Make sure to pass the function as a prop
      />

      {customButtons}
    </form>
  );
};

export default SearchFilter;
