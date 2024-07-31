import React from 'react';
import FormSelect from '../../../components/forms/FormSelect';

const FilterOptions = ({ products}) => {
  console.log(products)

  const filterProducts = (products, selectedFilters) => {
    return products.filter(product => {
      return (
        (!selectedFilters.category || product.category === selectedFilters.category) &&
        (!selectedFilters.size || product.selectedSizes.includes(selectedFilters.size)) &&
        (!selectedFilters.variation || product.selectedVariations.includes(selectedFilters.variation))
      );
    });
  };


  return (
    <div className="w-96 h-auto bg-white absolute right-4 top-16 z-50 p-4 shadow-lg rounded-lg">

    </div>
  );
};

export default FilterOptions;
