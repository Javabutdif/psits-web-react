import React from "react";
import { QRCode } from "react-qr-code"; // Import the QRCode component

const QRCodePage = ({ closeView, event }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
        <i
          className="fas fa-times mb-4 text-3xl text-[#074873] hover:text-red-600 transition duration-200 cursor-pointer"
          onClick={closeView}
        ></i>
        <div className="ml-3 mr-3">
          <h1 className="text-xl text-[#074873] font-semibold">{event.title}</h1>
          <p className="text-gray-600 text-sm pb-3">{event.date}</p>
        <div className="">
          <img
            src={event.imageDetails}
            alt={event.title}
            className="w-[600px] h-[300px] object-cover rounded-xl mx-auto mb-2"
          />
        </div>
          <h2 className="text-lg font-semibold mb-2 text-[#074873]">Details</h2>
          <p className="text-gray-700 text-sm">{event.details}</p>
        </div>
 
        {/* QR Code Generator */}
        <div className="flex justify-center mt-10">
          <QRCode value="https://psits-web.vercel.app/" size={170} fgColor="#074873" />
        </div>

        <div className="flex justify-center mt-6">
          <h3 className="text-lg font-medium ">Scan QR Code for attendance</h3>
        </div>
      </div>
    </div>
  );
};
 
export default QRCodePage;
