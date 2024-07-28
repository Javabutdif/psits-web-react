import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import "../../App.css";
import { merchandise } from "../../api/admin";
import TableComponent from '../../components/Custom/TableComponent'; // Adjust the import path as needed
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Merchandise() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      const result = await merchandise();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <div className="flex items-center gap-2">
          <img src={row.imageUrl} alt={row.name} width="50" height="50" className="rounded-md shadow-sm" />
          <div className="text-sm font-medium text-gray-800">{row.name}</div>
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
          <Link
            to={{
              pathname: "/admin/product/edit",
              state: { product: row },
            }}
          >
            <button className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition duration-150 text-xs">
              Edit
            </button>
          </Link>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-400 transition duration-150 text-xs"
            onClick={() => handleView(row)}
          >
            View
          </button>
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
          style={" h-[380px] md:h-[440px] lg:h-[480px] xl:h-[460px] "}
          otherButton={(
            <Link to="/admin/merchandise/product">
              <button className="bg-red-100 text-pink-800 hover:bg-red-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2">
                {/* Icon always visible */}
                <i className="fas fa-cart-plus text-sm text-base"></i>
                {/* Text hidden on small screens */}
                <span className="hidden md:inline ml-2">Add Product</span>
              </button>
            </Link>

          )}
          pageType="merchandise" // Set the page type accordingly
        />
        {isViewModalOpen && selectedItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Product Details</h2>
              <div className="flex justify-center mb-4">
                <img src={selectedItem.imageUrl} alt={selectedItem.name} width="120" height="120" className="rounded-md shadow-sm" />
              </div>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-700">ID:</strong> {selectedItem._id}
                </div>
                <div>
                  <strong className="text-gray-700">Name:</strong> {selectedItem.name}
                </div>
                <div>
                  <strong className="text-gray-700">Category:</strong> {selectedItem.category}
                </div>
                <div>
                  <strong className="text-gray-700">Batch:</strong> Batch {selectedItem.batch}
                </div>
                <div>
                  <strong className="text-gray-700">Price:</strong> {selectedItem.price}
                </div>
                <div>
                  <strong className="text-gray-700">Controls:</strong> {selectedItem.control}
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
