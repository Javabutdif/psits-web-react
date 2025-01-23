import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCodePage from "./QRCodePage";

function StudentEvents() {
  const [showView, setShowView] = useState(false); // State to manage popup visibility
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store selected event data
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "ICT Congress 2026",
      date: "Coming Soon...", 
      imageUrl: "/ict-congresss.jpg",
      imageDetails: "/congressView.png",
      stock: 10,
      details: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est deleniti delectus voluptatem fugit laboriosam sint necessitatibus eligendi modi aliquam similique et distinctio molestias nulla, laudantium, dicta quos. Minima, sapiente consectetur.",
    },
    {
      id: 2,
      title: "Valentine's Day",
      date: "Coming Soon...",
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      imageDetails: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736695587924_merch7.png",
      stock: 5,
      details: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est deleniti delectus voluptatem fugit laboriosam sint necessitatibus eligendi modi aliquam similique et distinctio molestias nulla, laudantium, dicta quos. Minima, sapiente consectetur.",
    },
    {
      id: 3,
      title: "UC Days",
      date: "Coming Soon...",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736775171764_merch1.png",
      imageDetails: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736775171764_merch1.png",
      stock: 5,
      details: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est deleniti delectus voluptatem fugit laboriosam sint necessitatibus eligendi modi aliquam similique et distinctio molestias nulla, laudantium, dicta quos. Minima, sapiente consectetur.",

    },
    {
      id: 4,
      title: "ICT Congress 2025",
      date: "Coming Soon...",
      imageUrl:
        "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736696596377_merch3.png",
       imageDetails: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736696596377_merch3.png",
      stock: 5,
      details: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est deleniti delectus voluptatem fugit laboriosam sint necessitatibus eligendi modi aliquam similique et distinctio molestias nulla, laudantium, dicta quos. Minima, sapiente consectetur.",

    },
    {
      id: 5,
      title: "Pre-CCS Days",
      date: "Coming Soon...",
      imageUrl: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736775171764_merch1.png",
      imageDetails: "https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1736775171764_merch1.png",
      stock: 10,
      details: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est deleniti delectus voluptatem fugit laboriosam sint necessitatibus eligendi modi aliquam similique et distinctio molestias nulla, laudantium, dicta quos. Minima, sapiente consectetur.",

    },
  ];

  const handleButtonClick = (event) => {
    setSelectedEvent(event); // Store selected event data
    setShowView(true); // Show the QRCodePage
  };

  const closePopup = () => {
    setShowView(false); // Hide the QRCodePage
    setSelectedEvent(null); // Clear selected event data
  };

  return (
    
    <>
      <hr />
      <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2x1:grid-cols-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:-translate-y-2 transition-transform duration-200"
          >
            <div className="p-5 mb-3">
              <img
                src={event.imageUrl}
                alt={event.title}
                // className="object-cover mb-4 p-0 rounded-md w-full h-[300px]"
                className="w-full h-[300px] object-cover rounded-xl"
              />
            </div>
            <div className="p-4 -mt-8">
              <h1 className="pl-3 text-xl font-semibold text-[#074873] truncate mb-2">
                {event.title}
              </h1>
              <div className="pl-3 pb-3 flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-[#074873]">
                  {event.date}
                </h2>
              </div>
              <div className="flex justify-center pb-3">
                <button
                  onClick={() => handleButtonClick(event)}
                  className="w-72 bg-[#4398AC] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:scale-105 transition-transform duration-200 max-w-[280px]"
                >
                  View Details
                </button> 
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conditionally render the QRCodePage as a popup */}
      {showView && (
        <QRCodePage closeView={closePopup} event={selectedEvent} />
      )}
    </>
  );
}

export default StudentEvents;
