import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { getPosition } from "../../../authentication/Authentication";

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
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const position = getPosition();

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

  useEffect(() => {
    if (selectAll) {
      setSelectedRows(filteredData.map((item) => item.id_number));
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, filteredData]);

  const handleRowSelection = (id_number) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id_number)
        ? prevSelectedRows.filter((id) => id !== id_number)
        : [...prevSelectedRows, id_number]
    );
  };

  const columns = [
    {
      key: "select",
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={() => setSelectAll(!selectAll)}
          />
        </motion.div>
      ),
      cell: (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id_number)}
            onChange={() => handleRowSelection(row.id_number)}
          />
        </motion.div>
      ),
    },
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
      cell: (row) => (
        <div className="text-xs">
          <div className="text-gray-500">
            {row.course} - {row.year}
          </div>
        </div>
      ),
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
      key: "actions",
      label: "",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="Edit"
            onClick={() => handleEditButtonClick(row)}
            icon={<i className="fas fa-edit" />} // Simple icon
            styles="flex items-center space-x-2 bg-gray-200 text-gray-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            textClass="text-gray-800" // Elegant text color
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
          />
          <FormButton
            type="button"
            text="Delete"
            onClick={() => showModal(row)}
            icon={<i className="fas fa-trash" />} // Simple icon
            styles="flex items-center space-x-2 bg-gray-200 text-red-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            textClass="text-red-800" // Elegant text color
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
          />
        </ButtonsComponent>
      ),
    },
  ];

  return (
    <div className="">
      <TableComponent
        columns={columns}
        data={filteredData}
        customButtons={
          <ButtonsComponent>
            {selectedRows.length > 0 && (
              <FormButton
                type="button"
                text="Delete All"
                // onClick={handleDeleteAll} // Ensure this is the correct handler for deletion
                icon={<i className="fas fa-trash-alt"></i>} // Updated icon
                styles="flex items-center space-x-2 bg-gray-100 text-gray-800 rounded-md py-2 px-4 transition duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm" // Elegant and minimal
                textClass="hidden"
                whileHover={{ scale: 1.01, opacity: 0.9 }}
                whileTap={{ scale: 0.95, opacity: 0.8 }}
              />
            )}

            <FormButton
              type="button"
              text={
                position !== "President" && position !== "Developer"
                  ? "Not Authorized"
                  : "Renew All"
              }
              onClick={() => {
                if (position === "President" || position === "Developer") {
                  showConfirm(); // Invoke the function
                }
              }}
              icon={
                <i
                  className={`fa ${
                    position !== "President" && position !== "Developer"
                      ? "fa-lock"
                      : "fa-sync-alt"
                  }`}
                ></i>
              }
              styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
                position !== "President" && position !== "Developer"
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-red-500"
              }`}
              textClass="text-white"
              whileHover={{ scale: 1.02, opacity: 0.95 }}
              whileTap={{ scale: 0.98, opacity: 0.9 }}
              disabled={position !== "President" && position !== "Developer"} // Use && instead of ||
            />
          </ButtonsComponent>
        }
      />
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
