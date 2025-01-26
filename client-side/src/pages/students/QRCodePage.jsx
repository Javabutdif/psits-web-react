import React from "react";
import { QRCode } from "react-qr-code"; // Import the QRCode component
import { formatDate } from "../../utils/stringUtils";

const QRCodePage = ({ closeView, event }) => {
  // Handle modal backdrop clicks
  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      closeView();
    }
  };

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-screen overflow-auto">
        {/* Close Icon */}
        <i
          className="fas fa-times absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition duration-200 cursor-pointer"
          onClick={closeView}
        ></i>

        {/* Content Wrapper */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#074873]">
              {event.eventName}
            </h1>
            <p className="text-gray-500 mb-4 text-sm">
              {formatDate(event.eventDate)}
            </p>
            <div className="w-full overflow-hidden rounded-xl">
              <img
                src={event.eventImage[0]}
                alt={event.eventName}
                className="w-full h-[300px] object-cover"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#074873]">
                Event Details
              </h2>
              <p className="text-gray-700 text-sm text-justify leading-relaxed">
                {event.eventDescription}
              </p>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-semibold text-[#074873] mb-4">
                QR Code for Attendance
              </h2>
              <div className="flex justify-center">
                <QRCode
                  value="https://psits-web.vercel.app/"
                  size={170}
                  fgColor="#074873"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Scan this code to confirm your attendance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
