import React, { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";



/* const Events = (props) => {
	const videoRef = useRef(null);
	const [result, setResult] = useState("");
	const [showAttendance, setShowAttendance] = useState(false);

	useEffect(() => {
		const qrScanner = new QrScanner(
			videoRef.current,
			(result) => {
				alert("QR Code result:", result.data);
				setResult(result.data);
			},
			{
				returnDetailedScanResult: true, // Optional: more scan data
			}
		);

		qrScanner.start();

		// Clean up the scanner on unmount
		return () => qrScanner.destroy();
	}, []);

	const handleHelloClick = () => {
		setShowAttendance(true); // Show the Attendance component when the button is clicked
	  };

	  const tabs = [
		{
		  path: "/admin/Attendance",
		  text: `Attendance`,
		  icon: "fas fa-users",
		}
	  ];
	

	return (
		<div>
			<h1>QR Scanner</h1>
			<video ref={videoRef} style={{ width: "100%" }}></video>
			<p>Result: {result}</p>


			// {/* Button to toggle Attendance component }
			<button onClick={handleHelloClick}>Hello</button>

			// {/* Conditionally render Attendance }
			{showAttendance && <Attendance />}


		<div>
		<div className="flex flex-col py-4 space-y-4">
			<div className="w-full flex flex-col">
			<Tab
				tabs={tabs}
				styles={"flex flex-col lg:flex-row items-stretch"}
				activePath={currentPath}
			/>
			</div>
			<Outlet />
		</div>
		</div>
		</div>


	);
}; */

const Events = (props) => {
	const [activeTab, setActiveTab] = useState(0);
	  return (
		// Figuring out how to do Pagination..? Still Figuring Things Out
		//TODO: Figure out how to create the layout of the specific_event tab
		
		<div className="container mx-auto p-4 ">
			<div className="relative">
				<div className=" flex flex-col gap-2 md:flex-row md:justify-between md:items-center p-2">
				</div>
				<div className="md:overflow-x-auto shadow-sm rounded-sm border bg-white p-6 space-y-4">
					{/* For the Events Name and back button?*/}
					<div className="flex flex-row">
						<div className="flex items-center justify-center gap-10 border bg-gray py-2 px-2">
							<div className="flex items-center justify-center">
								<i class="fas fa-chevron-left text-xl"></i>
							</div>
							<div className="flex items-center justify-center ">
								<h1 className="text-3xl font-bold mb-4">Event-Name</h1>
							</div>
						</div>
					</div>

					{/* Container for the multipleTabs  */}


					<div className="overflow-x-auto">
						<Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
							<TabList>
								{/* Numbers are not dynamic */}
								<Tab>UC-Main (2000)</Tab>
								<Tab>UC-Banilad (2000)</Tab>
								<Tab>UC-LM (2000)</Tab>
								<Tab>UC-PT (2000)</Tab>
							</TabList>
							{/* <TabPanel>
								<p>Content for UC-Main</p>
							</TabPanel>
							<TabPanel>
								<p>Content for UC-Banilad</p>
							</TabPanel>
							<TabPanel>
								<p>Content for UC-LM</p>
							</TabPanel>
							<TabPanel>
								<p>Content for UC-PT</p>
							</TabPanel> */}
							<TabPanel>
								<div className="mb-6 p-4 rounded-lg shadow-md">
									<h2 className="text-xl font-bold mb-4">Membership Sales Summary</h2>
									<table className="min-w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
									<thead style={{ backgroundColor: "#0e4a6a", color: "#fff" }}>
										<tr>
										<th className="border px-4 py-2 text-left">
											Membership Type
										</th>
										<th className="border px-4 py-2 text-left">
											Registered Students
										</th>
										<th className="border px-4 py-2 text-left">Total Revenue</th>
										</tr>
									</thead>
									<tbody>
										<tr>
										<td className="border px-4 py-2">Membership</td>
										{/* <td className="border px-4 py-2">{membershipCount}</td> */}
										<td className="border px-4 py-2">
											{/* ₱{membershipRevenue.toFixed(2)} */}
										</td>
										</tr>
										<tr>
										<td className="border px-4 py-2">Renewal</td>
										{/* <td className="border px-4 py-2">{renewalCount}</td> */}
										<td className="border px-4 py-2">
											{/* ₱{renewalRevenue.toFixed(2)} */}
										</td>
										</tr>
									</tbody>
									</table>
								</div>
							</TabPanel>
						</Tabs>
					</div>




				</div>
			</div>
		</div>

	);


};

export default Events;
