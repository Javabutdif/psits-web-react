import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  membership,
  studentDeletion,
  renewAllStudent,
} from "../../../api/admin";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmationModal from "../../../components/common/modal/ConfirmationModal";
import { ConfirmActionType } from "../../../enums/commonEnums";
import { showToast } from "../../../utils/alertHelper";
import { InfinitySpin } from "react-loader-spinner";
import { getUser } from "../../../authentication/Authentication";
import TableComponent from "../../../components/Custom/TableComponent";
import FormButton from "../../../components/forms/FormButton";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import EditMember from "./EditMember";
import axios from "axios";
import backendConnection from "../../../api/backendApi";

const Membership = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const fetchData = async () => {
    try {
      const result = await membership();
      setData(result);
      setFilteredData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  const handleEditButtonClick = (row) => {
    setMemberToEdit(row);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setMemberToEdit(null);
  };

  const handleSaveEditedMember = async (updatedMember) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendConnection()}/api/editedStudent`,
        updatedMember
      );
      console.log(response.data.message);
      showToast("success", "Student updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred."
      );
    }

    fetchData();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return [
        item.first_name,
        item.middle_name,
        item.last_name,
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

  const handleExportPDF = (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Name", "Id Number", "Course", "Email Account", "Type"]],
      body: filteredData.map((item) => [
        `${item.first_name} ${item.middle_name} ${item.last_name}`,
        item.id_number,
        item.course,
        item.email,
        item.type,
      ]),
      startY: 20, // Ensure the table starts after 20 units from the top
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

  const showModal = (row) => {
    setIsModalVisible(true);
    setStudentIdToBeDeleted(row.id_number);
  };

  const showConfirm = () => {
    setIsRenewalModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setIsRenewalModalVisible(false);
    setStudentIdToBeDeleted("");
  };

  const handleRenewal = async () => {
    setIsLoading(true);
    try {
      if (await renewAllStudent()) {
        setIsRenewalModalVisible(false);
        showToast(
          "success",
          "All student memberships are currently being renewed."
        );
        fetchData();
      } else {
        console.error("Failed to renew all students");
        showToast("error", "Student Renewal Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error renewing all students:", error);
      showToast("error", "Student Renewal Failed! Please try again.");
    }
    setIsRenewalModalVisible(false);
    setIsLoading(false);
  };

  const handleConfirmDeletion = async () => {
    setIsLoading(true);
    try {
      const id_number = studentIdToBeDeleted;
      const [name] = getUser();
      if ((await studentDeletion(id_number, name)) === 200) {
        const updatedData = data.filter(
          (student) => student.id_number !== id_number
        );
        setData(updatedData);
        setIsModalVisible(false);
        showToast("success", "Student Deletion Successful!");
      } else {
        console.error("Failed to delete student");
        showToast("error", "Student Deletion Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("error", "Student Deletion Failed! Please try again.");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      selector: (row) =>
        `${row.first_name} ${row.middle_name} ${row.last_name}`,
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
      key: "membership",
      label: "Membership",
      selector: (row) => row.membership,
      sortable: true,
      cell: (row) => (
        <div className="text-center">
          <span
            className={`px-2 py-1 rounded text-xs ${
              row.membership === "None"
                ? "bg-gray-200 text-gray-800"
                : row.membership === "Pending"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {row.membership === "None"
              ? "None"
              : row.membership === "Pending"
              ? "Pending"
              : "Active"}
          </span>
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
            className={`${
              row.status === "True"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            } px-2 py-1 rounded text-xs`}
          >
            {row.status === "True" ? "Active" : "Expired"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 text-md">
          <button
            className="text-blue-500 p-2 rounded hover:bg-blue-100 transition-colors"
            onClick={() => handleEditButtonClick(row)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="text-red-500 p-2 rounded hover:bg-red-100 transition-colors"
            onClick={() => showModal(row)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh] w-full">
          <InfinitySpin
            visible={true}
            width="200"
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <TableComponent
          columns={columns}
          data={filteredData}
          customButtons={
            <ButtonsComponent>
              <FormButton
                type="button"
                text="Export to PDF"
                onClick={handleExportPDF}
                icon={<i className="fas fa-file-pdf text-sm md:text-base"></i>}
                styles="bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                textClass="hidden md:inline"
              />
              <FormButton
                type="button"
                text="Renew All Students"
                onClick={showConfirm}
                icon={<i className="fas fa-check text-xs md:text-sm"></i>}
                styles="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2"
                textClass="hidden md:inline"
              />
              {/* Add any other custom buttons here */}
            </ButtonsComponent>
          }
        />
      )}
      {isEditModalVisible && (
        <EditMember
          isVisible={isEditModalVisible}
          onClose={handleEditModalClose}
          studentData={memberToEdit}
          onSave={handleSaveEditedMember}
        />
      )}
      {isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.DELETION}
          onCancel={hideModal}
          onConfirm={handleConfirmDeletion}
        />
      )}
      {isRenewalModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.RENEWAL}
          onCancel={hideModal}
          onConfirm={handleRenewal}
        />
      )}
    </div>
  );
};

export default Membership;
