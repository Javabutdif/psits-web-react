import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { InfinitySpin } from "react-loader-spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { membershipHistory } from "../../api/admin";
import MembershipHeader from "../../components/admin/MembershipHeader";

function MembershipHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await membershipHistory();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const id_number = item.id_number ? item.id_number.toLowerCase() : "";
      const name = item.name ? item.name.toLowerCase() : "";
      const course = item.course ? item.course.toLowerCase() : "";
      const year = item.year ? item.year.toLowerCase() : "";
      const date = item.date ? item.date.toLowerCase() : "";
      const admin = item.admin ? item.admin.toLowerCase() : "";

      return (
        id_number.includes(searchQuery.toLowerCase()) ||
        name.includes(searchQuery.toLowerCase()) ||
        course.includes(searchQuery.toLowerCase()) ||
        year.includes(searchQuery.toLowerCase()) ||
        date.includes(searchQuery.toLowerCase()) ||
        admin.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Name", "Course", "Year", "Date", "Admin"]],
      body: filteredData.map((item) => [
        item.id_number,
        item.name,
        item.course,
        item.year,
        item.date,
        item.admin,
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
    doc.save("membership_history.pdf");
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_number,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.course,
      sortable: true,
    },
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Admin",
      selector: (row) => row.admin,
      sortable: true,
    },
  ];

  return (
    <div className=" p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <InfinitySpin
            visible={true}
            width="200"
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <MembershipHeader />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 px-4 py-2 border rounded"
          />
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
            customStyles={{
              table: {
                style: {
                  borderRadius: "0.5rem",
                },
              },
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
                  padding: "8px",
                },
              },
              rows: {
                style: {
                  borderBottom: "1px solid #ddd",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default MembershipHistory;
