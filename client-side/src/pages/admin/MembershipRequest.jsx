import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../utils/alertHelper";
import {
  membershipRequest,
  cancelMembership,
  membershipPrice,
} from "../../api/admin";
import TableComponent from "../../components/Custom/TableComponent";

import ConfirmationModal from "../../components/common/modal/ConfirmationModal";

import { ConfirmActionType } from "../../enums/commonEnums";
import ApproveModal from "../../components/admin/ApproveModal";
import {
  financeAndAdminConditionalAccess,
  generateReferenceCode,
  handlePrintDataPos,
} from "../../components/tools/clientTools";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FormButton from "../../components/forms/FormButton";

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
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [price, setPrice] = useState(0);

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
        `${row.first_name} ${row.middle_name} ${row.last_name} ${row.rfid} ${row.id_number}`,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{`${row.first_name} ${row.middle_name} ${row.last_name}`}</div>
          <div className="text-gray-500">ID: {row.id_number}</div>
          <div className="text-gray-500">RFID: {row.rfid}</div>
        </div>
      ),
    },

    {
      key: "course",
      label: "Course & Year",
      selector: (row) => `${row.course} ${row.year}`,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div className="text-gray-500">
            {" "}
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
      label: "Type",
      selector: (row) => row.membershipStatus,
      sortable: true,
      cell: (row) => (
        <div className="text-center">
          <span className="text-xs font-semibold text-start">
            {row.membershipStatus === "PENDING" && row.isFirstApplication
              ? "Membership"
              : "Renewal"}
          </span>
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text={
              financeAndAdminConditionalAccess() ? "Approve" : "Not Authorized"
            }
            onClick={() => {
              if (financeAndAdminConditionalAccess()) {
                handleOpenModal(row);
              }
            }}
            icon={
              <i
                className={`fa ${
                  !financeAndAdminConditionalAccess() ? "fa-lock" : "fa-check"
                }`}
              ></i>
            }
            styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
              financeAndAdminConditionalAccess()
                ? "bg-[#002E48]"
                : "bg-gray-500 cursor-not-allowed"
            }`}
            textClass="text-white"
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
            disabled={!financeAndAdminConditionalAccess()}
          />
          <FormButton
            type="button"
            text={
              !financeAndAdminConditionalAccess() ? "Not Authorized" : "Cancel"
            }
            onClick={() => {
              if (financeAndAdminConditionalAccess()) {
                showModal(row);
              }
            }}
            icon={
              <i
                className={`fa ${
                  !financeAndAdminConditionalAccess() ? "fa-lock" : "fa-trash"
                }`}
              ></i>
            }
            styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
              !financeAndAdminConditionalAccess()
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#4398AC]"
            }`}
            textClass="text-white"
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
            disabled={!financeAndAdminConditionalAccess}
          />
        </ButtonsComponent>
      ),
    },
  ];

  const handleOpenModal = (row) => {
    setIsModalOpen(true);
    setSelectedStudentId(row.id_number);
    setSelectedStudentCourse(row.course);
    setSelectedStudentYear(row.year);
    const name = row.first_name + " " + row.middle_name + " " + row.last_name;

    setSelectedStudentName(handlePrintDataPos(name));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId("");
    fetchData();
  };

  const fetchData = async () => {
    try {
      const result = await membershipRequest();
      const price = await membershipPrice();
      setPrice(price ? price : 0);
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
      const first_name = item.first_name?.toLowerCase() || "";
      const middle_name = item.middle_name?.toLowerCase() || "";
      const last_name = item.last_name?.toLowerCase() || "";
      const id_number = item.id_number?.toLowerCase() || "";
      const course = item.course?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";
      const type = item.type?.toLowerCase() || "";
      const rfid = item.rfid?.toLowerCase() || "";

      const query = searchQuery.toLowerCase();

      return (
        first_name.includes(query) ||
        middle_name.includes(query) ||
        last_name.includes(query) ||
        id_number.includes(query) ||
        course.includes(query) ||
        email.includes(query) ||
        type.includes(query) ||
        rfid.includes(query)
      );
    });

    setFilteredData(filtered);
  }, [searchQuery, data]);

  const handleConfirmDeletion = async () => {
    try {
      await cancelMembership(studentIdToBeDeleted);
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
    handleCloseModal();
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

  return (
    <>
      <TableComponent
        columns={columns}
        data={data}
        customButtons={
          <ButtonsComponent>
            {selectedRows.length > 0 && (
              <FormButton
                type="button"
                text="Delete All"
                icon={<i className="fas fa-trash-alt"></i>} // Updated icon
                styles="flex items-center space-x-2 bg-gray-100 text-gray-800 rounded-md py-2 px-4 transition duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm" // Elegant and minimal
                textClass="hidden"
                whileHover={{ scale: 1.01, opacity: 0.9 }}
                whileTap={{ scale: 0.95, opacity: 0.8 }}
              />
            )}
          </ButtonsComponent>
        }
      />

      {isModalVisible && (
        <ConfirmationModal
          confirmType={ConfirmActionType.CANCEL}
          onCancel={hideModal}
          onConfirm={handleConfirmDeletion}
        />
      )}
      {isModalOpen && (
        <ApproveModal
          reference_code={generateReferenceCode()}
          id_number={selectedStudentId}
          course={selectedStudentCourse}
          year={selectedStudentYear}
          name={selectedStudentName}
          type={"Membership"}
          onCancel={handleCloseModal}
          onSubmit={handleFormSubmit}
          qty={1}
          itemTotal={price}
          total={price}
        />
      )}
    </>
  );
}

export default MembershipRequest;
