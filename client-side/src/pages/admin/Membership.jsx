import React, { useState, useEffect } from "react";
import "../../App.css";
import DataTable from "react-data-table-component";
import MembershipHeader from "../../components/admin/MembershipHeader";
import { membership, studentDeletion, renewAllStudent } from "../../api/admin";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";
import { ConfirmActionType } from "../../enums/commonEnums";
import { showToast } from "../../utils/alertHelper";
import { InfinitySpin } from "react-loader-spinner";
import { getUser } from "../../authentication/Authentication";

const Membership = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState("");

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
        console.error("Failed to renew all student");
        showToast("error", "Student Renewal Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error to renew all student:", error);
      showToast("error", "Student Renewal Failed! Please try again.");
    }
    setIsRenewalModalVisible(false);
    setIsLoading(false);
  };

  const handleConfirmDeletion = async () => {
    setIsLoading(true);
    try {
      const id_number = studentIdToBeDeleted;
      const [name, position] = getUser();
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
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div className="flex">
          <span
            className={`${
              row.status === "True"
                ? "bg-green-400 text-green-800"
                : "bg-red-300 text-red-700"
            } px-8 py-2 rounded-xl`}
          >
            {row.status === "True" ? "Active" : "Expired"}
          </span>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-2 my-2 container mx-3">
          <button
            className=" text-white px-4 py-2 rounded"
            style={{ backgroundColor: "#002E48" }}
          >
            Print Icon
          </button>
          <button className=" text-white bg-blue-600 px-4 py-2 rounded">
            Edit
          </button>
          <button
            className=" text-white bg-red-500 px-4 py-2 rounded"
            onClick={() => showModal(row)}
          >
            Delete
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
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={showConfirm}
        >
          Renew All Students
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
