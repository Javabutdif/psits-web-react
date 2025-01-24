import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import "react-tabs/style/react-tabs.css";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import FormButton from "../../../components/forms/FormButton";
import AttendanceTab from "./AttendanceTab";
import ViewStudentAttendance from "./ViewStudentAttendance";




const Attendance = (props) => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true); 
	const [showModal, setShowModal] = useState(false);
	const [selectedData, setSelectedData] =useState(null);
	const [scanQRCode, handleScanQRCode] = useState();
	const [currentEvent, setCurrentEvent] = useState("");
	const [activeTab, setActiveTab] = useState(0);
	const [filteredData, setFilteredData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [selectAll, setSelectAll] = useState(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [morning, setMorning] = useState(false);
  const [afternoon, setAfternoon] = useState(false);

	const handleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((id) => id !== id)
        : [...prevSelectedRows, id]
    );
  };
	useEffect(() => {
		if (selectAll) {
			setSelectedRows(filteredData.map((item) => item.id));
		} else {
			setSelectedRows([]);
		}
	}, [selectAll, filteredData]);

  const handleCloseModal = () => {
    setShowModal(false);
  };
	const handleViewBtn=(studentData)=>{
		setSelectedData(studentData)
		setShowModal(true);
	}


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
						checked={selectedRows.includes(row.id)}
						onChange={() => handleRowSelection(row.id)}
					/>
				</motion.div>
			),
		},
		{
			key: "student",
			label: "Student",
			sortable: true,
			selector: (row) => row.student, // Add selector for the student field
			cell: (row) => (
				<div className="text-left">
					<div className="font-semibold text-gray-900">{row.student}</div>
					<div className="text-xs text-gray-500">ID: {row.id}</div>
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
			key: "status",
			label: "Status",
			sortable: true,
			selector: (row) =>
				row.morning && row.afternoon
					? "Complete"
					: row.morning || row.afternoon
					? "Incomplete"
					: "Pending", // Add selector for status field
			cell: (row) => {
				const status =
					row.morning && row.afternoon
						? "Complete"
						: row.morning || row.afternoon
						? "Incomplete"
						: "Pending";
	
				return (
					<div className="text-left">
						<span
							className={`px-2 py-1 rounded text-xs ${
								status === "Complete"
									? "bg-green-200 text-green-800"
									: status === "Incomplete"
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
			key: "time",
			label: "Confirmed Time",
			sortable: true,
			selector: (row) => row.time, // Add selector for time field
			cell: (row) => new Date(row.time).toLocaleString(),
		},
		{
			key: "confirmed",
			label: "Confirmed By",
			sortable: true,
			selector: (row) => row.confirmed, // Add selector for confirmed field
			cell: (row) => row.confirmed,
		},
		{
			key: "action",
			label: "Action",
			// cell: (row) => (
			// 	<button
			// 		onClick={() => handleScanQRCode(row.id)}
			// 		className="px-4 bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
			// 	>
			// 		View
			// 	</button>
			// ),
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

	
	
  // Dummy data gpt
	const dummyData = async () => {
		// Simulating an async operation (like fetching data)
		return new Promise((resolve) => {	
			setTimeout(() => {
				resolve([
					{
						student: "Jacinth Cedric Barral",
						id: "23784994",
						course: "BSIT",
						year: "2rd Year",
						type: "Student",
						morning: true,
						afternoon: true,
						time: "2025-01-16T09:00:00Z",
					},
					{
						student: "John Doe",
						id: "202310002",
						course: "BSIT",
						year: "3rd Year",
						type: "Full-time",
						morning: true,
						afternoon: false,
						time: "2025-01-16T09:00:00Z",
					},
					{
						student: "Jane Smith",
						id: "202310003",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: false,
						afternoon: false,
						time: "2025-01-15T14:30:00Z",
					},
					{
						student: "Alice Johnson",
						id: "202310004",
						course: "CS",
						year: "1st Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-14T11:15:00Z",
					},
					{
						student: "Bob Brown",
						id: "202310005",
						course: "CS",
						year: "4th Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T13:45:00Z",
					},
					{
						student: "Eve White",
						id: "202310006",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-13T10:00:00Z",
					},
					{
						student: "Michael Lee",
						id: "202310007",
						course: "BSIT",
						year: "3rd Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-17T12:00:00Z",
					},
					{
						student: "Sarah Brown",
						id: "202310008",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-14T09:00:00Z",
					},
					{
						student: "Chris Evans",
						id: "202310009",
						course: "CS",
						year: "4th Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T15:30:00Z",
					},
					{
						student: "Nina Patel",
						id: "202310010",
						course: "CS",
						year: "1st Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-15T08:00:00Z",
					},
					{
						student: "George Martin",
						id: "202310011",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-13T11:45:00Z",
					},
					{
						student: "Emma Watson",
						id: "202310012",
						course: "BSIT",
						year: "3rd Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T10:30:00Z",
					},
					{
						student: "Tom Hardy",
						id: "202310013",
						course: "CS",
						year: "1st Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-14T14:00:00Z",
					},
					{
						student: "Kate Middleton",
						id: "202310014",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-12T13:00:00Z",
					},
					{
						student: "Will Smith",
						id: "202310015",
						course: "CS",
						year: "4th Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T07:45:00Z",
					},
					{
						student: "Olivia Pope",
						id: "202310016",
						course: "BSIT",
						year: "3rd Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-14T16:30:00Z",
					},
					{
						student: "Harry Styles",
						id: "202310017",
						course: "CS",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-13T12:00:00Z",
					},
					{
						student: "Zara Ali",
						id: "202310018",
						course: "BSIT",
						year: "1st Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T09:00:00Z",
					},
					{
						student: "Liam Neeson",
						id: "202310019",
						course: "BSIT",
						year: "3rd Year",
						type: "Full-time",
						morning: true,
						afternoon: true,
						time: "2025-01-15T08:30:00Z",
					},
					{
						student: "Scarlett Johansson",
						id: "202310020",
						course: "BSIT",
						year: "2nd Year",
						type: "Part-time",
						morning: true,
						afternoon: true,
						time: "2025-01-16T13:00:00Z",
					}
				]);
			}, 2000); // Simulating 1 second delay
		});
	};
	
  
const fetchData = async () => {
		try {
			setLoading(true);
			// TODO: Modify This to fetch Real Data (not dummy data)
			const result = await dummyData();
			setData(result);
			setFilteredData(result);
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
				</div>) : (
					<div className="flex flex-col gap-5 p-2 md:flex-col sm:flex-col">			
						<div className="md:overflow-x-auto shadow-sm rounded-sm border bg-white p-2 space-y-4">
							<motion.div
								className=" flex flex-row justify-between items-center product-detail  p-3 sm:p-2 mx-auto"
								initial={{ opacity: 0 }}
								z
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<div className="ml-2">
									<h2 className="text-3xl font-bold">Event-Name</h2>
								</div>

								<div>
									<ButtonsComponent>
									<div className="py-2">
										<Link to="/admin/addAttendee">
												<motion.button
												type="button"
												text="Add Attendee"
												className="bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 rounded-md px-6 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
												textClass="text-white" // Elegant text color
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
									// searchQuery={searchQuery}
									// setSearchQuery={setSearchQuery}
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
