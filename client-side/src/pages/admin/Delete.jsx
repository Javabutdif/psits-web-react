import React, { useState, useEffect } from "react";
import "../../App.css";
import TableComponent from "../../components/Custom/TableComponent";
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
  const [studentIdToBeRestored, setStudentIdToBeRestored] = useState("");

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
        `${item.first_name} ${item.middle_name} ${item.last_name}`,
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
    setStudentIdToBeRestored(row.id_number);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setStudentIdToBeRestored("");
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const id_number = studentIdToBeRestored;
      if ((await studentRestore(id_number)) === 200) {
        const updatedData = data.filter((student) => student.id_number !== id_number);
        setData(updatedData);
        setFilteredData(updatedData); // Update filteredData as well
        setIsModalVisible(false);
        showToast("success", "Student Restoration Successful!");
      } else {
        console.error("Failed to restore student");
        showToast("error", "Student Restoration Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error restoring student:", error);
      showToast("error", "Student Restoration Failed! Please try again.");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.first_name} ${row.middle_name} ${row.last_name}`}</div>
          <div>RFID: {row.rfid}</div>
        </div>
      ),
    },
    { key: "id_number", label: "Id Number", sortable: true,  },
    { key: "course", label: "Course", sortable: true },
    { key: "email", label: "Email Account", sortable: true },
    { key: "type", label: "Type", sortable: true, cell: () => (
      <div className="text-center">
        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">Student</span>
      </div>
    ), },
    { key: "deletedDate", label: "Deletion Date", sortable: true },
    { key: "deletedBy", label: "Deleted By", sortable: true },
    {
      key: "actions",
      cell: (row) => (
        <button
        onClick={() => showModal(row)}
        className="text-red-500 hover:text-red-700"
        aria-label="Restore"
        >
          <i className="fas fa-undo"></i>
        </button>
        
      
      ),
    },
  ];

  return (
    <div className="container container-fluid">
        <>
          <TableComponent
            columns={columns}
            data={filteredData}
            handleExportPDF={handleExportPDF}
            pageType="delete"
          />
          {isModalVisible && (
            <ConfirmationModal
              confirmType={ConfirmActionType.RESTORE}
              onCancel={hideModal}
              onConfirm={handleRestore}
              isLoading={isLoading}
            />
          )}
        </>
    </div>
  );
};

export default Delete;

