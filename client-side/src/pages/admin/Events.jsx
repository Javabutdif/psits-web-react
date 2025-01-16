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
      title: "ICT Congress 2025",
      price: "₱700.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 10, // Example stock count
    },
    {
      id: 2,
      title: "ICT Congress 2030",
      price: "₱800.00",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5, // Example stock count
    },
  ];

  return (
    <div className="flex justify-center space-x-4">
      {events.map((event) => (
        <div className="w-1/4 border border-gray-300  rounded-lg shadow-md">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mb-4 p-0 rounded-md"
          />
						<div className="p-4"> 
								<h1 className="text-2xl font-bold mb-4">{event.title}</h1>
								<div className="flex justify-between items-center mb-3">
									<h2 className="card-title text-xl font-semibold">{event.price}</h2>
									<span class="text-xs text-gray-500">Stock: {event.stock}</span>
								</div>
							<button className="w-full bg-[#002E48] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200" tabIndex="0">
								View
							</button>
						</div>
        </div>
      ))}
    </div>
  );
}

export default Events;
