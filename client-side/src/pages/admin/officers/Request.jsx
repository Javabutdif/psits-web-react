import { officerRestore, getSuspendOfficers } from "../../../api/admin";

import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import TableComponent from "../../../components/Custom/TableComponent";
import ConfirmationModal from "../../../components/common/modal/ConfirmationModal";
import FormButton from "../../../components/forms/FormButton";

import { ConfirmActionType } from "../../../enums/commonEnums";
import { showToast } from "../../../utils/alertHelper";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const Request = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [studentIdToBeDeleted, setStudentIdToBeDeleted] = useState("");

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchData = async () => {
    try {
      const result = await getSuspendOfficers();
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
      const searchLower = searchQuery.toLowerCase();
      return [item.name, item.id_number, item.email, item.position, item.course]
        .map((value) => (value ? value.toString().toLowerCase() : ""))
        .some((value) => value.includes(searchLower));
    });
    setFilteredData(filtered);
  }, [searchQuery, data]);

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

      if ((await officerRestore(id_number)) === 200) {
        const updatedData = data.filter(
          (student) => student.id_number !== id_number
        );
        setData(updatedData);
        setIsModalVisible(false);
        showToast("success", "Officer Restored Successful!");
      } else {
        console.error("Failed to restore officer");
        showToast("error", "Officer Restore Failed! Please try again.");
      }
    } catch (error) {
      console.error("Error restoring officer:", error);
      showToast("error", "Officer Restoring Failed! Please try again.");
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
      selector: (row) => `${row.name}`,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.name}`}</div>
        </div>
      ),
    },
    {
      key: "id_number",
      label: "Id ",
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
      key: "position",
      label: "Position",
      selector: (row) => row.position,
      sortable: true,
    },

    {
      key: "actions",
      label: "",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="Recover"
            onClick={() => showModal(row)}
            icon={<i className="fas fa-trash" />} // Simple icon
            styles="flex items-center space-x-2 bg-gray-200 text-green-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            textClass="text-green-800" // Elegant text color
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
          />
        </ButtonsComponent>
      ),
    },
  ];

  return (
    <div className="">
      <TableComponent columns={columns} data={filteredData} />

      {isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.RESTORE}
          onCancel={hideModal}
          onConfirm={handleConfirmDeletion}
        />
      )}
    </div>
  );
};

export default Request;
