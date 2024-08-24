import React, { useState, useEffect, useRef } from "react";
import SearchFilter from "./merchandise/SearchFilter";
import { merchandise } from "../../api/admin";
import ProductList from "./merchandise/ProductList";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FormButton from "../../components/forms/FormButton";
import FilterOptions from "./merchandise/FilterOptions";
import Pagination from "../../components/Custom/Pagination"; // Adjust the import path as needed
import { MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const StudentMerchandise = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filterOptionsRef = useRef(null);
  const navigate = useNavigate();
  // Adjust itemsPerPage based on the viewport width
  const updateItemsPerPage = () => {
    if (window.innerWidth >= 1280) {
      // xl
      setItemsPerPage(10);
    } else if (window.innerWidth >= 1024) {
      // lg
      setItemsPerPage(8);
    } else if (window.innerWidth >= 768) {
      // md
      setItemsPerPage(6);
    } else if (window.innerWidth >= 640) {
      // sm
      setItemsPerPage(4);
    } else {
      // xs
      setItemsPerPage(2);
    }
  };

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const toggleFilterOption = () => {
    setIsFilterOptionOpen((prevState) => !prevState);
  };

  const handleCategoryChange = (category, checked) => {
    setSelectedCategories((prevState) =>
      checked
        ? [...prevState, category]
        : prevState.filter((c) => c !== category)
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleControlChange = (control, checked) => {
    setSelectedControls((prevState) =>
      checked ? [...prevState, control] : prevState.filter((c) => c !== control)
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSizeChange = (size, checked) => {
    setSelectedSizes((prevState) =>
      checked ? [...prevState, size] : prevState.filter((s) => s !== size)
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleVariationChange = (variation, checked) => {
    setSelectedVariations((prevState) =>
      checked
        ? [...prevState, variation]
        : prevState.filter((v) => v !== variation)
    );
    setCurrentPage(1); // Reset to first page on filter change
  };
const fetchData = async () => {
  setIsLoading(true);
  try {
    const result = await merchandise();


    const currentDate = new Date();

    const filteredProducts = result.filter((item) => {
      const startDate = new Date(item.start_date);
      const endDate = new Date(item.end_date);

    
      return currentDate >= startDate && currentDate <= endDate;
    });

 
    setProducts(filteredProducts);
  } catch (error) {
    console.error("Error fetching data: ", error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterOptionsRef.current &&
        !filterOptionsRef.current.contains(event.target)
      ) {
        setIsFilterOptionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const name = product.name ? product.name.toLowerCase() : "";
    const price = product.price ? product.price.toFixed(2) : "";
    const category = product.category ? product.category.toLowerCase() : "";
    const control = product.control
      ? product.control.toLowerCase().split(" ")[0]
      : "";
    const sizes = Array.isArray(product.selectedSizes)
      ? product.selectedSizes
      : [];
    const variations = Array.isArray(product.selectedVariations)
      ? product.selectedVariations
      : [];

    const searchQueryLower = searchQuery.toLowerCase();
    const matchesSearchQuery =
      name.includes(searchQueryLower) || price.includes(searchQueryLower);

    const sizesMatch =
      selectedSizes.length === 0 ||
      selectedSizes.find((size) => sizes.includes(size));
    const variationsMatch =
      selectedVariations.length === 0 ||
      selectedVariations.some((variation) => variations.includes(variation));

    return (
      matchesSearchQuery &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(category)) &&
      (selectedControls.length === 0 || selectedControls.includes(control)) &&
      sizesMatch &&
      variationsMatch
    );
  });

  // Calculate pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Pagination Controls
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const myCart = () => {
    navigate("../cart");
  };

  return (
    <main className="py-5">
      <SearchFilter
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        customButtons={
          <ButtonsComponent>
            <div className="relative flex gap-2">
              <FormButton
                type="button"
                text="Filter"
                onClick={toggleFilterOption}
                icon={<i className="fas fa-filter text-sm md:text-base"></i>}
                styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                textClass="hidden md:inline"
              />

              <FormButton
                type="button"
                text="My Cart"
                onClick={myCart}
                icon={<MdShoppingCart size={18} color="white" />}
                styles="bg-[#002E48] text-gray-800 hover:bg-opacity-80 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                textClass="text-white hidden md:inline"
              />

              {isFilterOptionOpen && (
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
                  />
                </div>
              )}
            </div>
          </ButtonsComponent>
        }
      />
      <ProductList products={currentProducts} isLoading={isLoading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </main>
  );
};

export default StudentMerchandise;
