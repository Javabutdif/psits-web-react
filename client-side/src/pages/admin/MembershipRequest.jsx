import React, { useState, useEffect } from "react";
import "../../App.css";
import { showToast } from "../../utils/alertHelper";
import { membershipRequest, requestDeletion } from "../../api/admin";
import MembershipHeader from "../../components/admin/MembershipHeader";
import TableComponent from "../../components/Custom/TableComponent";
import { getUser } from "../../authentication/Authentication";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";

import { ConfirmActionType } from "../../enums/commonEnums";
import ApproveModal from "../../components/admin/ApproveModal";

function MembershipRequest() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentCourse, setSelectedStudentCourse] = useState("");
  const [selectedStudentYear, setSelectedStudentYear] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [name, position] = getUser();

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
      name: "Applied on",
      label: "Applied on",
      selector: (row) => row.applied,
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-xs">{row.applied}</p>
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
                  row.status === "False" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                } px-2 py-1 rounded text-xs`}
              >
                <i
                  className={`fa ${
                    row.status === "False" ? "fa-check-circle" : "fa-times-circle"
                  } mr-1 ${row.status === "False" ? "text-green-500" : "text-red-500"}`}
                ></i>
                {row.status === "False" ? "Paid" : "Unpaid"}
              </span>
            </div>
          ),
        },
        {
          name: "Action",
          cell: (row) => (
            <div className="flex justify-evenly gap-3">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => handleOpenModal(row)}
                disabled={
                  position !== "Treasurer" &&
                  position !== "Assistant Treasurer" &&
                  position !== "Auditor" &&
                  position !== "Developer" &&
                  position !== "President"
                }
              >
                <i className="fas fa-check"></i>
                {position !== "Treasurer" &&
                position !== "Assistant Treasurer" &&
                position !== "Auditor" &&
                position !== "Developer" &&
                position !== "President"
                  ? "Not Authorized"
                  : "Approve"}
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => showModal(row)}
                disabled={
                  position !== "Treasurer" &&
                  position !== "Assistant Treasurer" &&
                  position !== "Auditor" &&
                  position !== "Developer" &&
                  position !== "President"
                }
              >
                <i className="fas fa-trash"></i>
                {position !== "Treasurer" &&
                position !== "Assistant Treasurer" &&
                position !== "Auditor" &&
                position !== "Developer" &&
                position !== "President"
                  ? "Not Authorized"
                  : "Delete"}
              </button>
            </div>

      ),
    },
  ];

  const handleOpenModal = (row) => {
    setIsModalOpen(true);
    setSelectedStudentId(row.id_number);
    setSelectedStudentCourse(row.course);
    setSelectedStudentYear(row.year);
    const name = row.first_name + " " + row.middle_name + " " + row.last_name;
    const words = name.split(" ");
    let fullName = "";

    for (let i = 0; i < words.length - 1; i++) {
      fullName += words[i].charAt(0) + ".";
    }
    fullName += " " + words[words.length - 1];

    setSelectedStudentName(fullName);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId("");
    fetchData();
  };

  const fetchData = async () => {
    try {
      const result = await membershipRequest();
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
        course.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        type.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      html: "#my-table",
      styles: { cellWidth: "wrap" },
      margin: { top: 20 },
    });
    doc.save("table.pdf");
  };

  const handleConfirmDeletion = async () => {
    try {
      await requestDeletion(studentIdToBeDeleted);
      showToast("Student has been deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting student: ", error);
      showToast("Error deleting student.", "error");
    }
    setIsModalVisible(false);
    fetchData();
  };

  const showModal = (row) => {
    setStudentIdToBeDeleted(row.id_number);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setStudentIdToBeDeleted("");
  };

  const handleFormSubmit = async () => {
    // Add logic for form submission if needed
    handleCloseModal();
  };

  return (
    <>
      <TableComponent
        columns={columns}
        data={data}
        style={" md:h-[300px] lg:h-[350px] xl:h-[310px] "}
        pageType={"request"}
        handleExportPDF={handleExportPDF}
      />

      
{isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.DELETION}
          onCancel={hideModal}
          onConfirm={handleConfirmDeletion}
        />
      )}
      {isModalOpen && (
        <ApproveModal
          reference_code={
            Math.floor(Math.random() * (999999999 - 111111111)) + 111111111
          }
          id_number={selectedStudentId}
          course={selectedStudentCourse}
          year={selectedStudentYear}
          name={selectedStudentName}
          type={"Membership"}
          onCancel={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </>
  );
}

export default MembershipRequest;


