import React, { useState, useEffect } from "react";
import "../../App.css";
import DataTable from "react-data-table-component";
import backendConnection from "../../api/backendApi";
import { InfinitySpin } from "react-loader-spinner";
import axios from "axios";
import { showToast } from "../../utils/alertHelper";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";
import { ConfirmActionType } from "../../enums/commonEnums";
import ApproveModal from "../../components/admin/ApproveModal";
import { renewStudent, requestDeletion } from "../../api/admin";
import MembershipHeader from "../../components/admin/MembershipHeader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getUser } from "../../authentication/Authentication";

function MembershipRequest() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRfid, setSelectedRfid] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentCourse, setSelectedStudentCourse] = useState("");
  const [selectedStudentYear, setSelectedStudentYear] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [name, position] = getUser();

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const handleOpenModal = (row) => {
    setIsModalOpen(true);
    setSelectedStudentId(row.id_number);
    setSelectedStudentCourse(row.course);
    setSelectedStudentYear(row.year);
    setSelectedRfid(row.rfid);
    const name = row.first_name + " " + row.middle_name + " " + row.last_name;
    const words = name.split(" ");
    let fullName = "";

    for (let i = 0; i < words.length - 1; i++) {
      fullName += words[i].charAt(0) + ".";
    }
    fullName += " " + words[words.length - 1];

    setSelectedStudentName(fullName);

    console.log(fullName);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId("");
    fetchData();
  };

  const handleFormSubmit = (data) => {
    console.log("Form submitted successfully:", data);
  };

  const fetchData = async () => {
    try {
      const result = await renewStudent();
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

      return (
        first_name.includes(searchQuery.toLowerCase()) ||
        middle_name.includes(searchQuery.toLowerCase()) ||
        last_name.includes(searchQuery.toLowerCase()) ||
        id_number.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        type.includes(searchQuery.toLowerCase()) ||
        course.includes(searchQuery)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Name", "Id Number", "Course", "Year", "Email", "Type", "Renewed On"],
      ],
      body: filteredData.map((item) => [
        item.first_name + " " + item.middle_name + " " + item.last_name,
        item.id_number,
        item.course,
        item.year,
        item.email,
        "Student",
        item.renewedOn,
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
    doc.save("students.pdf");
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
      name: "Year",
      selector: (row) => row.year,
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
      name: "Renewed on",
      selector: (row) => row.renewedOn,
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-xs`">{row.renewedOn}</p>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.membership,
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-red-600">Unpaid</p>
        </div>
      ),
    },

    {
      name: "Action",
      cell: (row) => (
        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleOpenModal(row)}
            disabled={
              position !== "Treasurer" &&
              position !== "Assistant Treasurer" &&
              position !== "Auditor" &&
              position !== "Developer" &&
              position !== "President"
            }
          >
            {position !== "Treasurer" &&
            position !== "Assistant Treasurer" &&
            position !== "Auditor" &&
            position !== "Developer" &&
            position !== "President"
              ? "Not Authorized"
              : "Approve"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
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

      {isModalOpen && (
        <ApproveModal
          reference_code={
            Math.floor(Math.random() * (999999999 - 111111111)) + 111111111
          }
          id_number={selectedStudentId}
          type={"Renewal"}
          course={selectedStudentCourse}
          year={selectedStudentYear}
          name={selectedStudentName}
          rfid={selectedRfid}
          onCancel={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default MembershipRequest;
