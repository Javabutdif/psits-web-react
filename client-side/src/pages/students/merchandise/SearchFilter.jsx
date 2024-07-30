// components/Custom/SearchFilter.js
import React from 'react';
import SearchComponent from '../../../components/Custom/SearchComponent';

const SearchFilter = ({ searchQuery, handleSearchChange, customButtons }) => {
  return (
    <form className="flex gap-2">
      <SearchComponent 
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange} // Make sure to pass the function as a prop
      />

      {customButtons}
    </form>
  );
};

export default SearchFilter;
