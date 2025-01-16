import React from "react";



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

	  return (
		// Figuring out how to do Pagination..? Still Figuring Things Out
		//TODO: Figure out how to create the layout of the specific_event tab
		<div className="py-4 relative">
			<div className=" flex flex-col gap-2 md:flex-row md:justify-between md:items-center p-2">
          	</div>
			<div className="md:overflow-x-auto shadow-sm rounded-sm border bg-white p-6 space-y-4">
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
				<div>heloo</div>
			</div>

		</div>

	);


};

export default Events;
