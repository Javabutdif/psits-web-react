import { membershipHistory } from "../../api/admin";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import TableComponent from "../../components/Custom/TableComponent";
import Receipt from "../../components/common/Receipt";
import FormButton from "../../components/forms/FormButton";
import {
  formattedDate,
  financeAndAdminConditionalAccess,
} from "../../components/tools/clientTools";
import React, { useState, useEffect, useRef } from "react";
import ReactToPrint from "react-to-print";

function MembershipHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [rowData, setPrintData] = useState("");
  const [selectedStudent, setSelectedStudentName] = useState("");

  const componentRef = useRef();
  const printRef = useRef();

  const headers = [
    { label: "Reference ID", key: "reference_code" },
    { label: "ID", key: "id_number" },
    { label: "Name", key: "name" },
    { label: "Course", key: "course" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
    { label: "Admin", key: "admin" },
  ];

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return [
        item.name,

        item.id_number,
        item.email,
        item.type,
        item.course,
        item.rfid,
      ]
        .map((value) => (value ? value.toString().toLowerCase() : ""))
        .some((value) => value.includes(searchLower));
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handlePrintData = (row) => {
    setPrintData(row);
    setShouldPrint(true);
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

  const columns = [
    {
      key: "reference_code",
      label: "Reference",
      sortable: true,
    },
    {
      key: "id_number",
      label: "ID",
      sortable: true,
    },
    {
      key: "rfid",
      label: "RFID",
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{row.rfid} </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,

      cell: (row) => (
        <div className="text-xs">
          <div>{row.name} </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,

      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.course} - ${row.year}`}</div>
        </div>
      ),
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
      cell: (row) => (
        <div className="text-xs">
          <div>{`${formattedDate(row.date)}`}</div>
        </div>
      ),
    },
    {
      key: "admin",
      label: "Admin",
      sortable: true,
    },
    {
      key: "Print",
      label: "Print",
      sortable: false,
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text={financeAndAdminConditionalAccess() ? "Print" : ""}
            onClick={() => {
              if (financeAndAdminConditionalAccess()) {
                handlePrintData(row);
              }
            }}
            icon={
              <i
                className={`fa ${
                  financeAndAdminConditionalAccess() ? "fa-print" : "fa-lock"
                }`}
              ></i>
            }
            styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
              !financeAndAdminConditionalAccess()
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#002E48]"
            }`}
            textClass="text-white"
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
            disabled={!financeAndAdminConditionalAccess()}
          />
        </ButtonsComponent>
      ),
    },
  ];

  return (
    <>
      <TableComponent columns={columns} data={filteredData} />

      <div style={{ display: "none" }}>
        {shouldPrint && rowData && (
          <ReactToPrint
            trigger={() => (
              <button ref={printRef} style={{ display: "none" }}>
                Print
              </button>
            )}
            content={() => componentRef.current}
            onAfterPrint={handlePrintComplete}
          />
        )}
        {shouldPrint && rowData && (
          <Receipt
            ref={componentRef}
            reference_code={rowData.reference_code}
            course={rowData.course}
            product_name={rowData.product_name}
            batch={rowData.batch}
            size={rowData.size}
            variation={rowData.variation}
            total={50}
            cash={rowData.cash}
            year={rowData.year}
            name={selectedStudent}
            type={rowData.type}
            admin={rowData.admin}
            reprint={true}
            qty={1}
            itemTotal={50}
          />
        )}
      </div>
    </>
  );
}

export default MembershipHistory;
