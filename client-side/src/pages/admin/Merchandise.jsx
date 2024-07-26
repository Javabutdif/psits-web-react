import React, { useState, useEffect } from "react";
import "../../App.css";
import DataTable from "react-data-table-component";
import { merchandise } from "../../api/admin";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Merchandise() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const result = await merchandise();
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
      const name = item.name ? item.name.toLowerCase() : "";
      const category = item.category ? item.category.toLowerCase() : "";
      const price = item.price ? item.price.toString() : "";

      return (
        name.includes(searchQuery.toLowerCase()) ||
        category.includes(searchQuery.toLowerCase()) ||
        price.includes(searchQuery)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Product ID", "Product", "Category", "Price", "Product Controls"],
      ],
      body: filteredData.map((item) => [
        item._id,
        item.name,
        item.category,
        item.price,
        item.con,
      ]),
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      margin: { top: 10 },
    });
    doc.save("merchandise.pdf");
  };

  const columns = [
    {
      name: "Product ID",
      selector: (row) => row._id,
      sortable: true,
      cell: (row) => <div className="text-xs">{row._id}</div>,
    },
    {
      name: "Product",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Product Controls",
      selector: (row) => row.con,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-2 my-2 container mx-3">
          <button
            className=" text-white px-4 py-2 rounded"
            style={{ backgroundColor: "#002E48" }}
          >
            Edit
          </button>
          <button
            className=" text-white px-4 py-2 rounded"
            style={{ backgroundColor: "#4398AC" }}
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container container-fluid">
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />
      <div className="pb-3 flex justify-end ">
        <button
          className=" p-2 text-white rounded-xl"
          style={{ backgroundColor: "#4398AC" }}
        >
          Add Product
        </button>
      </div>
      <div className="mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleExportPDF}
        >
          Export to PDF
        </button>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        progressPending={loading}
        customStyles={{
          headCells: {
            style: {
              backgroundColor: "#074873",
              color: "#F5F5F5",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "1rem",
              textAlign: "center",
              border: "block",
              borderColor: "white",
            },
          },
          cells: {
            style: {
              padding: "8px", // Cell padding
            },
          },
          rows: {
            style: {
              borderBottom: "1px solid #ddd", // Row border
            },
          },
        }}
      />
    </div>
  );
}

export default Merchandise;
