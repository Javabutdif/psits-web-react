import React, { useState, useEffect, useRef } from 'react';
import SearchFilter from './merchandise/SearchFilter';
import { merchandise } from '../../api/admin';
import ProductList from './merchandise/ProductList';
import ButtonsComponent from '../../components/Custom/ButtonsComponent';
import FormButton from '../../components/forms/FormButton';
import FilterOptions from './merchandise/FilterOptions';

const StudentMerchandise = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filterOptionsRef = useRef(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await merchandise();
      setProducts(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterOptionsRef.current && !filterOptionsRef.current.contains(event.target)) {
        setIsFilterOptionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle filter changes
  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prevState =>
      checked ? [...prevState, category] : prevState.filter(c => c !== category)
    );
  };

  const handleControlChange = (control, checked) => {
    setSelectedControls(prevState =>
      checked ? [...prevState, control] : prevState.filter(c => c !== control)
    );
  };

  const handleSizeChange = (size, checked) => {
    setSelectedSizes(prevState =>
      checked ? [...prevState, size] : prevState.filter(s => s !== size)
    );
  };

  const handleVariationChange = (variation, checked) => {
    setSelectedVariations(prevState =>
      checked ? [...prevState, variation] : prevState.filter(v => v !== variation)
    );
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedControls([]);
    setSelectedSizes([]);
    setSelectedVariations([]);
    setSearchQuery("");
  };

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    const price = product.price ? product.price.toFixed(2) : '';
    const category = product.category ? product.category.toLowerCase() : '';
    const control = product.control ? product.control.toLowerCase().split(' ')[0] : '';
    const sizes = Array.isArray(product.selectedSizes) ? product.selectedSizes : [];
    const variations = Array.isArray(product.selectedVariations) ? product.selectedVariations : [];

    const searchQueryLower = searchQuery.toLowerCase();
    const matchesSearchQuery = name.includes(searchQueryLower) || price.includes(searchQueryLower);

    const sizesMatch = selectedSizes.length === 0 || selectedSizes.some(size => sizes.includes(size));
    const variationsMatch = selectedVariations.length === 0 || selectedVariations.some(variation => variations.includes(variation));

    return (
      matchesSearchQuery &&
      (selectedCategories.length === 0 || selectedCategories.includes(category)) &&
      (selectedControls.length === 0 || selectedControls.includes(control)) &&
      sizesMatch &&
      variationsMatch
    );
  });

  return (
    <div className="container mx-auto">
      <SearchFilter
        searchQuery={searchQuery}
        handleSearchChange={(e) => setSearchQuery(e.target.value)}
        customButtons={
          <ButtonsComponent>
            <div className="relative">
              <FormButton
                type="button"
                text="Filter"
                onClick={() => setIsFilterOptionOpen(prev => !prev)}
                icon={<i className="fas fa-filter text-sm md:text-base"></i>}
                styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                textClass="hidden md:inline"
              />
              {isFilterOptionOpen &&
                <div ref={filterOptionsRef}>
                  <FilterOptions
                    onCategoryChange={handleCategoryChange}
                    selectedCategories={selectedCategories}
                    onControlChange={handleControlChange}
                    selectedControls={selectedControls}
                    onSizeChange={handleSizeChange}
                    selectedSizes={selectedSizes}
                    onVariationChange={handleVariationChange}
                    selectedVariations={selectedVariations}
                    onClick={handleReset}
                  />
                </div>
              }
            </div>
          </ButtonsComponent>
        }
      />
      <ProductList products={filteredProducts} isLoading={isLoading} />
    </div>
  );
};

export default StudentMerchandise;
