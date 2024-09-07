import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../../App.css";
import { merchandiseAdmin, deleteMerchandise , publishMerchandise } from "../../api/admin";
import TableComponent from "../../components/Custom/TableComponent"; // Adjust the import path as needed
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Product from "./Product";
import FormButton from "../../components/forms/FormButton";
import EditProduct from "./EditProduct";
import "swiper/swiper-bundle.css";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FilterOptions from "../students/merchandise/FilterOptions";
import { Dialog } from "@headlessui/react";
import { AiOutlineClose } from "react-icons/ai";
import { showToast } from "../../utils/alertHelper";
import { isBefore, isAfter, isWithinInterval } from "date-fns";

function Merchandise() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddProductModal, setIsAddProductModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [merchToDelete, setMerchToDelete] = useState("");

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [merchToPublish, setMerchToPublish] = useState("");

  const [merchToEdit, setMerchToEdit] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState([]);

  const filterOptionsRef = useRef(null);

  const fetchData = async () => {
    try {
      const result = await merchandiseAdmin();
      setData(result);
      setFilteredData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const id_number = item._id ? item._id.toLowerCase() : "";
      const name = item.name ? item.name.toLowerCase() : "";
      const category = item.category ? item.category.toLowerCase() : "";
      const price = item.price ? item.price : "";
      const batch = item.batch ? item.batch : "";
      const control = item.control ? item.control.toLowerCase() : "";

      return (
        id_number.includes(searchQuery.toLowerCase()) ||
        name.includes(searchQuery.toLowerCase()) ||
        category.includes(searchQuery.toLowerCase()) ||
        price.includes(searchQuery.toLowerCase()) ||
        batch.includes(searchQuery.toLowerCase()) ||
        control.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

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

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    console.log("Opening Add Product Modal");
    setIsAddProductModal(true);
  };

  const handleCloseAddProduct = () => {
    fetchData();
    setIsAddProductModal(false);
  };

  const handleOpenEditModal = (row) => {
    setMerchToEdit(row);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const deleteMerchandiseApi = async () => {
    if (await deleteMerchandise(merchToDelete)) {
      showToast("success", "Merchandise Deleted");
      setDeleteModalOpen(false);
      fetchData();
    }
  };
  const publishMerchandiseApi = async () => {
    if (await publishMerchandise(merchToPublish)) {
      showToast("success", "Merchandise Publish!");
      setPublishModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteProductModal = (id) => {
    setMerchToDelete(id);
    setDeleteModalOpen(true);
  };
   const handlePublishProductModal = (id) => {
     setMerchToPublish(id);
     setPublishModalOpen(true);
   };

  const getStatus = (row) => {
    const currentDate = new Date();
    const startDate = new Date(row.start_date);
    const endDate = new Date(row.end_date);

    if (isBefore(currentDate, startDate)) {
      return row.is_active ? "Publishing" : "Pending";
    } else if (isAfter(currentDate, endDate)) {
      return row.is_active ? "Expired" : "Expired"; 
    } else {
      return row.is_active ? "Publishing" : "Deleted";
    }
  };

  const columns = [
    {
      key: "select",
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={() => setSelectAll(!selectAll)}
          />
        </motion.div>
      ),
      cell: (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id_number)}
            onChange={() => handleRowSelection(row.id_number)}
          />
        </motion.div>
      ),
    },

    {
      key: "name",
      label: "Product",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center justify-center md:justify-start gap-2">
          <img
            src={row.imageUrl[0]}
            alt={row.name}
            width="50"
            height="50"
            className="rounded-md shadow-sm"
          />
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "batch",
      label: "Batch",
      sortable: true,
      cell: (row) => `Batch ${row.batch}`,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      cell: (row) => `₱ ${row.price}`,
    },
    {
      key: "control",
      label: "Product Controls",
      sortable: true,
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      cell: (row) => (
        <div className="text-center">
          <span
            className={`px-2 py-1 rounded text-xs ${
              getStatus(row) === "Publishing"
                ? "bg-green-200 text-green-800"
                : getStatus(row) === "Expired"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {getStatus(row)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="View"
            onClick={() => handleView(row)}
            styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
            icon={<i className="fas fa-eye text-sm"></i>}
            textClass="ml-2 md:inline"
            iconClass="text-sm text-base"
          />

          <FormButton
            type="button"
            text="Edit"
            onClick={() => handleOpenEditModal(row)}
            styles="bg-green-200 text-green-800 hover:bg-green-200 active:bg-green-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
            icon={<i className="fas fa-edit text-sm"></i>}
            textClass="ml-2 md:inline"
            iconClass="text-sm text-base"
          />

          {row.is_active && (
            <FormButton
              type="button"
              text="Delete"
              onClick={() => handleDeleteProductModal(row._id)}
              styles="bg-red-100 text-pink-800 hover:bg-red-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
              icon={<i className="fas fa-trash text-sm"></i>}
              textClass="ml-2 md:inline"
              iconClass="text-sm text-base"
            />
          )}
          {!row.is_active && (
            <FormButton
              type="button"
              text="Publish"
              onClick={() => handlePublishProductModal(row._id)}
              styles="bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
              icon={<i className="fas fa-pen text-sm"></i>}
              textClass="ml-2 md:inline"
              iconClass="text-sm text-base"
            />
          )}
        </ButtonsComponent>
      ),
    },
  ];

  useEffect(() => {
    if (selectAll) {
      setSelectedRows(filteredData.map((item) => item.id_number));
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, filteredData]);

  const handleRowSelection = (id_number) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id_number)
        ? prevSelectedRows.filter((id) => id !== id_number)
        : [...prevSelectedRows, id_number]
    );
  };

  const handleCategoryChange = (category, checked) => {
    setSelectedCategories((prevState) =>
      checked
        ? [...prevState, category]
        : prevState.filter((c) => c !== category)
    );
  };

  const handleControlChange = (control, checked) => {
    setSelectedControls((prevState) =>
      checked ? [...prevState, control] : prevState.filter((c) => c !== control)
    );
  };

  const handleSizeChange = (size, checked) => {
    setSelectedSizes((prevState) =>
      checked ? [...prevState, size] : prevState.filter((c) => c !== size)
    );
  };

  const handleVariationChange = (variation, checked) => {
    setSelectedVariations((prevState) =>
      checked
        ? [...prevState, variation]
        : prevState.filter((v) => v !== variation)
    );
  };

  const applyFilters = () => {
    const filtered = data.filter((item) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);
      const controlMatch =
        selectedControls.length === 0 ||
        selectedControls.includes(item.control);
      const sizeMatch =
        selectedSizes.length === 0 || selectedSizes.includes(item.size);
      const variationMatch =
        selectedVariations.length === 0 ||
        selectedVariations.includes(item.variation);

      return categoryMatch && controlMatch && sizeMatch && variationMatch;
    });

    setFilteredData(filtered);
  };

  return (
    <div className="py-4 relative">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          <div className=" flex flex-col gap-2 md:flex-row md:justify-between md:items-center p-2">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-3xl text-gray-700 text-center md:text-left"
            ></motion.h1>
           
          </div>
          <div className="overflow-x-auto">
            <TableComponent
              columns={columns}
              data={filteredData}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              customButtons={
                <ButtonsComponent>
                  {/* Filters Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#0056b3' }}  // Hover effect for primary
                    whileTap={{ scale: 0.98, backgroundColor: '#003d7a' }}    // Active effect for primary
                    className="text-sm md:text-base bg-primary text-white flex items-center gap-2 px-5 py-2 border border-neutral-medium rounded-lg shadow-sm hover:shadow-md transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-highlight"
                    onClick={() => setIsFilterOptionOpen(!isFilterOptionOpen)}
                  >
                    <i className="fas fa-filter text-white"></i>
                    <span className="font-medium">Filters</span>
                  </motion.button>

                  {/* Add Product Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#0056b3' }}  // Hover effect for primary
                    whileTap={{ scale: 0.98, backgroundColor: '#003d7a' }}    // Active effect for primary
                    className="text-sm md:text-base bg-accent text-white flex items-center gap-2 px-5 py-2 border border-neutral-medium rounded-lg shadow-sm hover:shadow-md transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-highlight"
                    onClick={handleOpenAddProduct}
                  >
                    <i className="fas fa-plus text-white"></i>
                    <span className="font-medium">Add </span>
                  </motion.button>
    </ButtonsComponent>
              }
            />
          </div>
        </>
      )}

      {/* Filter Options */}
      {isFilterOptionOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={filterOptionsRef}
            className="bg-white p-4 rounded shadow-lg"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filter Options</h2>
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsFilterOptionOpen(false)}
              >
                &times;
              </button>
            </div>
            <FilterOptions
              selectedCategories={selectedCategories}
              selectedControls={selectedControls}
              selectedSizes={selectedSizes}
              selectedVariations={selectedVariations}
              handleCategoryChange={handleCategoryChange}
              handleControlChange={handleControlChange}
              handleSizeChange={handleSizeChange}
              handleVariationChange={handleVariationChange}
            />
            <div className="mt-4 flex justify-end">
              <FormButton
                type="button"
                text="Apply"
                onClick={() => {
                  applyFilters();
                  setIsFilterOptionOpen(false);
                }}
                styles="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}

      {isViewModalOpen && (
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true"></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-full w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-6 relative mx-auto">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsViewModalOpen(false)}
              >
                <span className="sr-only">Close</span>
                <AiOutlineClose className="w-6 h-6" aria-hidden="true" />
              </button>

              {/* Product Image */}
              <div className="mb-4">
                <img
                  src={selectedItem?.imageUrl}
                  alt={selectedItem?.name}
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedItem?.name}
                </h2>
                <p className="text-gray-600">Price: ₱{selectedItem?.price}</p>
                <p className="text-gray-600">Stocks: {selectedItem?.stocks}</p>
                <p className="text-gray-600">Batch: {selectedItem?.batch}</p>
                <p className="text-gray-600">
                  Description: {selectedItem?.description}
                </p>
                <p className="text-gray-600">
                  Category: {selectedItem?.category}
                </p>
                <p className="text-gray-600">
                  Start Date: {selectedItem?.start_date}
                </p>
                <p className="text-gray-600">
                  End Date: {selectedItem?.end_date}
                </p>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {isEditModalOpen && (
        <EditProduct
          handleCloseEditProduct={handleCloseEditModal}
          merchData={merchToEdit}
        />
      )}
      {/* Add Product Modal */}
      {isAddProductModal && (
        <Product handleCloseAddProduct={handleCloseAddProduct} />
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this product?</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={deleteMerchandiseApi}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {publishModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Publish</h2>
            <p>Are you sure you want to publish again this product?</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setPublishModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={publishMerchandiseApi}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Merchandise;
