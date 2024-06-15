import React, { useState, useEffect } from "react";
import "../../App.css";
import DataTable from "react-data-table-component";
import backendConnection from "../../api/backendApi";
import { InfinitySpin } from "react-loader-spinner";
import axios from "axios";
import { showToast } from "../../utils/alertHelper";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ConfirmActionType } from "../../enums/commonEnums";

function MembershipRequest() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${backendConnection()}/api/requestStudent`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
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
        <div className="d-flex flex-row gap-1 ">
          <button
            className="btn btn-primary"
            onClick={() => handleApproveButton(row.id_number)}
          >
            Approve
          </button>
          <button className="btn btn-danger" onClick={() => showModal(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleApproveButton = (row) => {
    // Handle button click action here
    console.log("Button clicked for row:", row);
  };

  const showModal = (row) => {
    setIsModalVisible(true);
    setStudentIdToBeDeleted(row.id_number);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setStudentIdToBeDeleted("");
  };

  const handleConfirmDeletion = async () => {
    setIsLoading(true);
    try {
      const id_number = studentIdToBeDeleted;
      const response = await axios.delete(
        `${backendConnection()}/api/students/hard_delete/${id_number}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
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
      showToast("error", "Student Deletion Failed! Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-center mt-5">Membership Request</h1>
      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <InfinitySpin
            visible={true}
            width="200"
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <DataTable
          className="table table-responsive"
          title="Student List"
          columns={columns}
          data={data}
          pagination
        />
      )}
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

export default MembershipRequest;
