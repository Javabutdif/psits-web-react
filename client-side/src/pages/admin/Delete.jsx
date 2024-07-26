import React, { useState, useEffect } from "react";
import "../../App.css";
import DataTable from "react-data-table-component";
import MembershipHeader from "../../components/admin/MembershipHeader";
import { deletedStudent, studentRestore } from "../../api/admin";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";
import { ConfirmActionType } from "../../enums/commonEnums";
import { showToast } from "../../utils/alertHelper";
import { InfinitySpin } from "react-loader-spinner";

const Delete = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [StudentIdToBeRestore, setStudentIdToBeRestore] = useState("");

  const fetchData = async () => {
    try {
      const result = await deletedStudent();
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
      const first_name = item.first_name ? item.first_name.toLowerCase() : "";
      const middle_name = item.middle_name
        ? item.middle_name.toLowerCase()
        : "";
      const last_name = item.last_name ? item.last_name.toLowerCase() : "";
      const id_number = item.id_number ? item.id_number.toLowerCase() : "";
      const course = item.course ? item.course.toString() : "";
      const email = item.email ? item.email.toString() : "";
      const type = item.type ? item.type.toString() : "";
      const rfid = item.rfid ? item.rfid.toString() : "";

      return (
        first_name.includes(searchQuery.toLowerCase()) ||
        middle_name.includes(searchQuery.toLowerCase()) ||
        last_name.includes(searchQuery.toLowerCase()) ||
        id_number.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        type.includes(searchQuery.toLowerCase()) ||
        course.includes(searchQuery) ||
        rfid.includes(searchQuery)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Id Number", "Course", "Email Account", "Type"]],
      body: filteredData.map((item) => [
        item.first_name + " " + item.middle_name + " " + item.last_name,
        item.id_number,
        item.course,
        item.email,
        item.type,
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
    doc.save("deleted_students.pdf");
  };

  const showModal = (row) => {
    setIsModalVisible(true);
    setStudentIdToBeRestore(row.id_number);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setStudentIdToBeRestore("");
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const id_number = StudentIdToBeRestore;

      if ((await studentRestore(id_number)) === 200) {
        const updatedData = data.filter(
          (student) => student.id_number !== id_number
        );
        setData(updatedData);
        setIsModalVisible(false);
        showToast("success", "Student Restoration Successful!");
      } else {
        console.error("Failed to restore student");
        showToast("error", "Student Restoration Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error restore student:", error);
      showToast("error", "Student Restoration Failed! Please try again.");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) =>
        row.first_name + " " + row.middle_name + " " + row.last_name,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>
            {row.first_name + " " + row.middle_name + " " + row.last_name}
          </div>
          <div>RFID: {row.rfid}</div>
        </div>
      ),
    },
    {
      name: "Id Number",
      selector: (row) => row.id_number,
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.course,
      sortable: true,
    },
    {
      name: "Email Account",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => "Student",
      sortable: true,
    },
    {
      name: "Deletion Date",
      selector: (row) => row.deletedDate,
      sortable: true,
      cell: (row) => (
        <div className="flex">
          <span>{row.deletedDate}</span>
        </div>
      ),
    },
    {
      name: "Deleted By",
      selector: (row) => row.deletedBy,
      sortable: true,
      cell: (row) => (
        <div className="flex">
          <span>{row.deletedBy}</span>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-2 my-2 container mx-3">
          <button
            className=" text-white bg-blue-500 px-4 py-2 rounded"
            onClick={() => showModal(row)}
          >
            Restore
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container container-fluid">
      <MembershipHeader />
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />

      <div className="mb-4 flex flex-row gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleExportPDF}
        >
          Export to PDF
        </button>
      </div>
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
      )}
      {isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.RESTORE}
          onCancel={hideModal}
          onConfirm={handleRestore}
        />
      )}
    </div>
  );
};

export default Delete;
