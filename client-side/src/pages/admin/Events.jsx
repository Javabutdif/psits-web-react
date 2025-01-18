import React, { useState, useRef, useEffect } from "react";

// import QrScanner from "qr-scanner";

// const Events = (props) => {
// 	const videoRef = useRef(null);
// 	const [result, setResult] = useState("");

// 	useEffect(() => {
// 		const qrScanner = new QrScanner(
// 			videoRef.current,
// 			(result) => {
// 				alert("QR Code result:", result.data);
// 				setResult(result.data);
// 			},
// 			{
// 				returnDetailedScanResult: true, // Optional: more scan data
// 			}
// 		);

// 		qrScanner.start();

// 		// Clean up the scanner on unmount
// 		return () => qrScanner.destroy();
// 	}, []);

// 	return (
// 		<div className="border border-gray-300 p-5 rounded-lg shadow-md">
// 			<h1>QR Scanner wasap </h1>
// 			   {/* <img src={profilePic} alt="" /> */}
// 				 <h2 className="card-title" >Hi i'm James Bond</h2>
//       <p>WASAP EVRYONEEE, THIS IS MY FIRST WEBSITE USING REACTJS</p>
			
// 			<video ref={videoRef} style={{ width: "10%" }}></video>
   
    
// 		</div>
// 	);
// }; 
function Events() {
  const events = [
    {
      id: 1,
      title: "Pre-CCS",
      price: "₱500.00",
      imageUrl: "/ict-congresss.jpg",
      stock: 10, // Example stock count
    },
    {
      id: 2,
      title: "Valentine's Day",
      price: "₱1000.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },
    {
      id: 3,
      title: "UC Days",
      price: "₱800.00",
      imageUrl: "/ict-congresss.jpg",
      stock: 5, // Example stock count
    },
    {
      id: 4,
      title: "ICT Congress 2025",
      price: "₱750.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },
    {
      id: 5,
      title: "Pre-CCS",
      price: "₱500.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 10, // Example stock count
    },
    {
      id: 6,
      title: "Valentine's Day",
      price: "₱1000.00",
      imageUrl: "/ict-congresss.jpg",
      stock: 5, // Example stock count
    },
    {
      id: 7,
      title: "UC Days",
      price: "₱800.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },

  ];

	return (
		<div>
			<h1>QR Scanner wasap </h1>
			<video ref={videoRef} style={{ width: "100%" }}></video>
			<p>Result: {result}</p>
		</div>
	);
};

export default Events;

