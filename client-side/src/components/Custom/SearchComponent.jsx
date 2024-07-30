import React from 'react';
import FormInput from '../../components/forms/FormInput';

const SearchComponent = ({ searchQuery, handleSearchChange }) => (
  <FormInput
    label="Search"
    type="text"
    id="id-number"
    name="id_number"
    value={searchQuery}
    onChange={handleSearchChange}
    styles="w-full flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Search by ID number"
  />
);

export default SearchComponent;