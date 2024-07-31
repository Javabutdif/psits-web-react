import React, { useState, useEffect } from 'react';
import SearchFilter from './merchandise/SearchFilter';
import { merchandise } from '../../api/admin';
import ProductList from './merchandise/ProductList';
import ButtonsComponent from '../../components/Custom/ButtonsComponent';
import FormButton from '../../components/forms/FormButton';
import FilterOptions from './merchandise/FilterOptions';

const StudentMerchandise = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilterOption = () => {
    setIsFilterOptionOpen(prevState => !prevState);
  };
  

  const fetchData = async () => {
    try {
      const result = await merchandise();
      setProducts(result); // Assuming result is an array of products
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to fetch data only once when component mounts

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <SearchFilter 
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        customButtons= {
          <ButtonsComponent>
            <div className="relative">
              <FormButton
                type="button"
                text="Filter"
                onClick={toggleFilterOption}
                icon={<i className="fas fa-filter text-sm md:text-base"></i>}
                styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                textClass="hidden md:inline"
              />
              {isFilterOptionOpen && <FilterOptions products={products} />}

            </div>
{/* 
            <FormButton 
               type="button"
               text="View Cart"
              //  onClick={handleExportPDF}
               icon={<i className="fas fa-shopping-cart text-sm md:text-base"></i>}
               styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
               textClass="hidden md:inline"
            
            /> */}
          </ButtonsComponent>
        }



      />
        <ProductList 
          products={filteredProducts}
        />
    </div>
  );
}

export default StudentMerchandise;
