import React, { useState, useEffect, useRef } from "react";
import TableComponent from "../../components/Custom/TableComponent";
import { membershipHistory } from "../../api/admin";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InfinitySpin } from "react-loader-spinner";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FormButton from "../../components/forms/FormButton";
import ReactToPrint from "react-to-print";
import Receipt from "../../components/common/Receipt";

function MembershipHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowData, setPrintData] = useState("");
  const [selectedStudent, setSelectedStudentName] = useState("");
  const componentRef = useRef();
  const printRef = useRef();

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
      const reference_code = item.reference_code
        ? item.reference_code.toLowerCase()
        : "";
      const name = item.name ? item.name.toLowerCase() : "";
      const type = item.type ? item.type.toLowerCase() : "";
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
        type.includes(searchQuery.toLowerCase()) ||
        reference_code.includes(searchQuery.toLowerCase()) ||
        admin.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handlePrintData = (row) => {
    setPrintData(row);
    const name = row.name;
    const words = name.split(" ");
    let fullName = "";

    for (let i = 0; i < words.length - 1; i++) {
      fullName += words[i].charAt(0) + ".";
    }
    fullName += " " + words[words.length - 1];

    setSelectedStudentName(fullName);
  };
  useEffect(() => {
    if (rowData) {
      printRef.current.click();
    }
  }, [rowData]);

  const handlePrintComplete = () => {
    setPrintData("");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "Reference ID",
          "ID",
          "Name",
          "Course",
          "Year",
          "Type",
          "Date",
          "Admin",
        ],
      ],
      body: filteredData.map((item) => [
        item.reference_code,
        item.id_number,
        item.name,
        item.course,
        item.year,
        item.type,
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
      key: "reference_code",
      label: "Reference ID",
      sortable: true,
    },

    {
      key: "name",
      label: "Name",
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.name} `}</div>
          <div className="text-gray-500">ID: {row.id_number}</div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
    },
    {
      key: "year",
      label: "Year",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
    },
    {
      key: "admin",
      label: "Admin",
      sortable: true,
    },
    {
      key: "Print",
      label: "Print",
      sortable: true,
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="Print"
            onClick={() => handlePrintData(row)}
            icon={<i className="fas fa-print" />} // Simple icon
            styles="flex items-center space-x-2 bg-gray-200 text-gray-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            textClass="text-gray-800"
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
          />
          <div style={{ display: "none" }}>
            <ReactToPrint
              trigger={() => (
                <button ref={printRef} style={{ display: "none" }}>
                  Print
                </button>
              )}
              content={() => componentRef.current}
              onAfterPrint={handlePrintComplete}
            />
            <Receipt
              ref={componentRef}
              reference_code={rowData.reference_code}
              course={rowData.course}
              product_name={rowData.product_name}
              batch={rowData.batch}
              size={rowData.size}
              variation={rowData.variation}
              total={rowData.type === "Membership" ? "50" : "20"}
              cash={rowData.cash}
              year={rowData.year}
              name={selectedStudent}
              type={rowData.type}
              admin={rowData.admin}
              reprint={true}
              qty={rowData.qty}
              itemTotal={rowData.itemTotal}
            />
          </div>
        </ButtonsComponent>
      ),
    },
  ];
  return (
    <>
      <TableComponent
        columns={columns}
        data={filteredData}
        customButtons={
          <ButtonsComponent>
            <FormButton
              type="button"
              text="PDF Export"
              onClick={handleExportPDF}
              icon={<i className="fas fa-file-pdf"></i>}
              styles="space-x-2 bg-gray-200 text-gray-800 rounded-md py-1 px-3 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              textClass="hidden"
              whileHover={{ scale: 1.01, opacity: 0.9 }}
              whileTap={{ scale: 0.95, opacity: 0.8 }}
            />
          </ButtonsComponent>
        }
      />
    </>
  );
}

export default MembershipHistory;
