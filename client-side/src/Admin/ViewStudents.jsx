import React, { useState, useEffect } from "react";
import "../App.css";
import DataTable from "react-data-table-component";
import backendConnection from "../api/backendApi";
import { useNavigate } from "react-router-dom";
import { setStudentData } from "../components/admin/EditStudentData";
import ConfirmationModal from "../components/common/ConfirmationModal.jsx";
import { ConfirmActionType } from "../enums/commonEnums.js";
import { showToast } from "../utils/alertHelper.jsx";

function ViewStudents() {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendConnection()}/api/students`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_number,
      sortable: true,
    },
    {
      name: "RFID",
      selector: (row) => row.rfid,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) =>
        row.first_name + " " + row.middle_name + " " + row.last_name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
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
      name: "Membership",
      selector: (row) => row.membership,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-row gap-1">
          <button
            className="btn btn-primary"
            onClick={() => handleEditButton(row)}
          >
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => showModal(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const showModal = (row) => {
    setIsModalVisible(true);
    setStudentIdToBeDeleted(row.id_number);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleEditButton = (row) => {
    setStudentData({ student: row });
    navigate("/editStudent");
  };

  const handleConfirmDeletion = async () => {
    try {
      const id_number = studentIdToBeDeleted;
      const response = await fetch(
        `${backendConnection()}/api/students/${id_number}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the deleted student from the data array
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
    }
  };

  return (
    <div>
      <h1 className="text-center mt-5">Registered Students</h1>
      <DataTable
        title="Student List"
        columns={columns}
        data={data}
        pagination
      />
      {isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.DELETION}
          onCancel={hideModal}
          onConfirm={handleConfirmDeletion}
        />
      )}
    </div>
  );
}

export default ViewStudents;
