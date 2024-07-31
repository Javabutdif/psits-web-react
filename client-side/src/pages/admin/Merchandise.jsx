import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import { merchandise } from "../../api/admin";
import TableComponent from "../../components/Custom/TableComponent"; // Adjust the import path as needed
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Product from "./Product";
import FormButton from "../../components/forms/FormButton";

function Merchandise() {
   const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddProductModal, setIsAddProductModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query

  const fetchData = async () => {
    try {
      const result = await merchandise();
      setData(result);
      setFilteredData(result); // Initialize filteredData with fetched data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    const filtered = data.filter((item) => {
      const id_number = item._id ? item._id.toLowerCase() : "";
      const name = item.name ? item.name.toLowerCase() : "";
      const category = item.category ? item.category.toLowerCase() : "";
      const price = item.price ? item.price : ""
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

  const handleExportPDF = (filteredData) => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Product ID", "Product", "Category", "Price", "Batch", "Controls"],
      ],
      body: filteredData.map((item) => [
        item._id,
        item.name,
        item.category,
        item.price,
        item.batch,
        item.control,
      ]),
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 100, 255],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      margin: { top: 10 },
    });
    doc.save("merchandise.pdf");
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleOpenAddProduct = () => setIsAddProductModal(true);
  const handleCloseAddProduct = () => setIsAddProductModal(false);

  const columns = [
    {
      key: "_id",
      label: "Product ID",
      sortable: true,
      cell: (row) => <div className="text-sm text-gray-600">{row._id}</div>,
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
    },
    {
      key: "control",
      label: "Product Controls",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      cell: (row) => (
          <div className="flex gap-2">
            <FormButton 
              type="button"
              text="View"
              onClick={() => handleView(row)} // Ensure the onClick is defined
              styles="bg-red-100 text-pink-800 hover:bg-red-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
              icon={<i className="fas fa-eye text-sm text-base"></i>} // Use a relevant icon for "View"
              textClass="ml-2 md:inline"
              iconClass="text-sm text-base"
            />
            
            <FormButton 
              type="button"
              text="Delete"
              // onClick={() => handleDelete(row)} // Updated handler for delete action
              styles="bg-red-100 text-pink-800 hover:bg-red-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
              icon={<i className="fas fa-trash text-sm text-base"></i>} // Use a relevant icon for "Delete"
              textClass="ml-2 md:inline"
              iconClass="text-sm text-base"
            />
          </div>

      ),
    },
  ];

  return (
    <>
      <TableComponent

          data={data}
          columns={columns}
          handleExportPDF={handleExportPDF}
          customButtons={(
            <FormButton 
              type="button"
              text="Add Product"
              onClick={handleOpenAddProduct}
                styles="bg-indigo-100 text-violet-800 hover:bg-violet-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
              icon={<i className="fas fa-cart-plus text-sm text-base"></i>}
              textClass="ml-2 md:inline"
              /* Ensure that textClass is responsive */
              iconClass="text-sm text-base" // If you need to apply specific styles to the icon
            />
          )}

      />
      {isAddProductModal && (
        <Product handleCloseAddProduct={handleCloseAddProduct} />
      )}

      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Product Details
            </h2>
            <div className="flex justify-center mb-4">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                width="120"
                height="120"
                className="rounded-md shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <div>
                <strong className="text-gray-700">ID:</strong>{" "}
                {selectedItem._id}
              </div>
              <div>
                <strong className="text-gray-700">Name:</strong>{" "}
                {selectedItem.name}
              </div>
              <div>
                <strong className="text-gray-700">Category:</strong>{" "}
                {selectedItem.category}
              </div>
              <div>
                <strong className="text-gray-700">Batch:</strong> Batch{" "}
                {selectedItem.batch}
              </div>
              <div>
                <strong className="text-gray-700">Price:</strong>{" "}
                {selectedItem.price}
              </div>
              <div>
                <strong className="text-gray-700">Controls:</strong>{" "}
                {selectedItem.control}
              </div>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-red-400 transition duration-150"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Merchandise;
