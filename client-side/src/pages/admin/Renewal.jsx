import React, { useState, useEffect } from "react";
import "../../App.css";
import backendConnection from "../../api/backendApi";
import { InfinitySpin } from "react-loader-spinner";
import axios from "axios";
import { showToast } from "../../utils/alertHelper";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";
import { ConfirmActionType } from "../../enums/commonEnums";
import ApproveModal from "../../components/admin/ApproveModal";
import { renewStudent } from "../../api/admin";
import MembershipHeader from "../../components/admin/MembershipHeader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getUser } from "../../authentication/Authentication";
import TableComponent from "../../components/Custom/TableComponent";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FormButton from "../../components/forms/FormButton";


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
      key: "name",
      label: "Name",
      selector: (row) => `${row.first_name} ${row.middle_name} ${row.last_name}`,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.first_name} ${row.middle_name} ${row.last_name}`}</div>
          <div className="text-gray-500">RFID: {row.rfid}</div>
        </div>
      ),
    },
    {
      key: "id_number",
      label: "Id Number",
      selector: (row) => row.id_number,
      sortable: true,
    },
    {
      key: "course",
      label: "Course",
      selector: (row) => row.course,
      sortable: true,
    },
    {
      key: "email",
      label: "Email Account",
      selector: (row) => row.email,
      sortable: true,
    },
    {
        key: "type",
        label: "Type",
        selector: () => "Student", // Static value for all rows
        sortable: true,
        cell: () => (
          <div className="text-center">
            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">Student</span>
          </div>
        ),
      },
   {
      name: "Renewed on",
      label: "Renewed on",
      selector: (row) => row.renewedOn,
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-xs">{row.renewedOn}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div className="text-center">
          <span
            className={`flex items-center gap-2 ${
              row.status === "True" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            } px-2 py-1 rounded text-xs`}
          >
            <i
              className={`fa ${
                row.status === "True" ? "fa-check-circle" : "fa-times-circle"
              } mr-1 ${row.status === "True" ? "text-green-500" : "text-red-500"}`}
            ></i>
            {row.status === "True" ? "Paid" : "Unpaid"}
          </span>
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex flex-col gap-3">
          <button
            className={`relative flex items-center gap-2 px-4 py-2 rounded text-white ${
              position !== "Treasurer" &&
              position !== "Assistant Treasurer" &&
              position !== "Auditor" &&
              position !== "Developer" &&
              position !== "President"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-500"
            }`}
            onClick={() => handleOpenModal(row)}
            disabled={
              position !== "Treasurer" &&
              position !== "Assistant Treasurer" &&
              position !== "Auditor" &&
              position !== "Developer" &&
              position !== "President"
            }
          >
            <i
              className={`fa ${
                position !== "Treasurer" &&
                position !== "Assistant Treasurer" &&
                position !== "Auditor" &&
                position !== "Developer" &&
                position !== "President"
                  ? "fa-lock"
                  : "fa-check"
              }`}
            ></i>
            {position !== "Treasurer" &&
            position !== "Assistant Treasurer" &&
            position !== "Auditor" &&
            position !== "Developer" &&
            position !== "President"
              ? "Not Authorized"
              : "Approve"}
            {position !== "Treasurer" &&
            position !== "Assistant Treasurer" &&
            position !== "Auditor" &&
            position !== "Developer" &&
            position !== "President" && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2">
                You do not have permission to approve.
              </span>
            )}
          </button>
        </div>
      ),
    }
    
  ];

  return (
    <div className="">
      <TableComponent
        columns={columns}
        data={filteredData}
        customButtons={(
          <ButtonsComponent>
          <FormButton
            type="button"
            text="Export to PDF"
            onClick={handleExportPDF}
            icon={<i className="fas fa-file-pdf text-sm md:text-base"></i>}
            styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
            textClass="hidden md:inline"
          />
          </ButtonsComponent>
        )}
      />
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
