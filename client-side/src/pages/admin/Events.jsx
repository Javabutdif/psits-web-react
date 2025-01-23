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
      title: "Pre-CCS ",
      price: "₱500.00",
      imageUrl: "/ict-congresss.jpg",
      stock: 10, // Example stock count
    },
    {
      id: 2,
      title: "Valentine's Day",
      price: "₱1000.00",
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
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
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },
    {
      id: 5,
      title: "Pre-CCS Days",
      price: "₱500.00",
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
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
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },
  ];

  return (
    <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2x1:grid-cols-6">
      {events.map((event) => (
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md hover:-translate-y-2 transition-transform duration-200">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="object-cover mb-4 p-0 rounded-md w-full h-[300px]"
          />
          <div className="p-4">
            <h1 className="text-lg font-semibold text-gray-800 truncate mb-2">
              {event.title}
            </h1>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-gray-900">
                {event.price}
              </h2>
              <span class="text-xs text-gray-500">Stock: {event.stock}</span>
            </div>

            <button
              className="w-full bg-[#002E48] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:scale-105 transition-transform duration-200"
              tabIndex="0"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Events;
