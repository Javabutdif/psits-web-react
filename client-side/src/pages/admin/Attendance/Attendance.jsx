import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Link, useNavigate, useParams } from "react-router-dom";
import "react-tabs/style/react-tabs.css";
import { getAttendees } from "../../../api/event";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import FormButton from "../../../components/forms/FormButton";
import AttendanceTab from "./AttendanceTab";
import ViewStudentAttendance from "./ViewStudentAttendance";

const Attendance = (props) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [scanQRCode, handleScanQRCode] = useState();
  const [currentEvent, setCurrentEvent] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [eventHasEnded, setEventHasEnded] = useState(false);

  const handleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id) // Use "rowId" instead of "id" to avoid shadowing
        : [...prevSelectedRows, id]
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getAllAttendees = async () => {
    return await getAttendees(eventId);
  };
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(filteredData.map((item) => item.id_number));
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, filteredData]);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleViewBtn = (studentData) => {
    console.log("Selected Data:", studentData); // Debugging
    setSelectedData(studentData);
    setShowModal(true);
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
      sortable: true,
      selector: (row) => row.name, // Add selector for the student field
      cell: (row) => (
        <div className="text-left">
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">ID: {row.id_number}</div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
      selector: (row) => row.course, // Add selector for course field
      cell: (row) => row.course,
    },
    {
      key: "year",
      label: "Year",
      sortable: true,
      selector: (row) => row.year, // Add selector for year field
      cell: (row) => row.year,
    },
    {
      key: "isAttended",
      label: "Status",
      sortable: true,
      selector: (row) => {
        if (row.isAttended) return "Attended";
        if (eventHasEnded && !row.isAttended) return "Absent";
        return "Ongoing";
      },

      cell: (row) => {
        const status =
          row.isAttended ? "Attended"
          : eventHasEnded && !row.isAttended ? "Absent"
          : "Ongoing"; 

        return (
          <div className="text-left">
            <span
              className={`px-2 py-1 rounded text-xs ${
                status === "Attended"
                  ? "bg-green-200 text-green-800"
                  : status === "Absent"
                  ? "bg-red-200 text-gray-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      key: "attendDate",
      label: "Confirmed Date",
      sortable: true,
      selector: (row) => row.attendDate, // Add selector for time field
      cell: (row) => new Date(row.attendDate).toLocaleString(),
    },
    {
      key: "confirmedBy",
      label: "Confirmed By",
      sortable: true,
      selector: (row) => row.confirmedBy, // Add selector for confirmed field
      cell: (row) => row.confirmedBy,
    },
    {
      key: "action",
      label: "Action",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="View"
            onClick={() => handleViewBtn(row)}
            icon={<i className="fas fa-eye" />} // Simple icon
            styles="px-4 bg-[#074873] text-[#DFF6FF] hover:bg-[#09618F] active:bg-[#0B729C] rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0A5C88] flex items-center gap-2"
            textClass="text-blue-100" // Elegant text color
            whileHover={{ scale: 1.02, opacity: 0.95 }}
            whileTap={{ scale: 0.98, opacity: 0.9 }}
          />
        </ButtonsComponent>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Modify This to fetch Real Data (not dummy data)
      const result = await getAllAttendees();
      setData(result.attendees);
      setFilteredData(result.attendees);
      setEventData(result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  const handleBackButton = () => {
    navigate("/admin/dashboard");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    // Figuring out how to do Pagination..? Still Figuring Things Out
    //TODO: Figure out how to create the layout of the specific_event tab - done?
    <div className="container mx-auto p-4 ">
      {loading ? (
        <div className="flex justify-center items-center w-full h-full">
          <InfinitySpin
            visible={true}
            width={200}
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-2 md:flex-col sm:flex-col">
          <div className=" shadow-sm rounded-sm border bg-white p-2 space-y-4">
            <motion.div
            className="flex flex-col sm:flex-row justify-between items-center product-detail p-3 sm:p-2 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ml-2 w-full">
              <h2 className="text-3xl font-bold">{eventData.eventName}</h2>
            </div>

            <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-4 sm:mt-0 whitespace-nowrap">
              <ButtonsComponent>
                <div className="py-2">
                  <Link to="/admin/addAttendee">
                    <motion.button
                      type="button"
                      text="Add Attendee"
                      className="bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2"
                      textClass="sm:block hidden text-white"
                      whileHover={{ scale: 1.01, opacity: 0.95 }}
                      whileTap={{ scale: 0.98, opacity: 0.9 }}
                    >
                      <i className="fas fa-add"></i> Add Attendee
                    </motion.button>
                  </Link>
                </div>
              </ButtonsComponent>
            </div>
          </motion.div>



            {/* Tabs and Table Container */}
          </div>
          <div className="md:overflow-x-auto shadow-sm rounded-sm space-y-4">
            <AttendanceTab
              columns={columns}
              filteredData={filteredData}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setIsFilterOpen={setIsFilterOpen}
            />
          </div>
        </div>
      )}

      {/* View Student Attendance Modal*/}
      {showModal && (
        <ViewStudentAttendance
          isVisible={showModal}
          onClose={handleCloseModal}
          studentData={selectedData}
        />
      )}
    </div>
  );
};

export default Attendance;
