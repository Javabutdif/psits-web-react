import React, { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

const ViewStudentAttendance = ({ isVisible, onClose, studentData }) => {
  if (!isVisible) {
    return null;
  }

  useEffect(() => {
    console.log("Modal Data:", studentData); // Debugging
  }, [studentData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className=" bg-white rounded-lg shadow-lg w-full max-w-2xl  relative sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <AiOutlineClose size={24} />
        </button>
        <div className=" p-5 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
          <div className="flex flex-col justify-left gap-2 p-2 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
            <h2 className="text-xl font-semibold">Student Attendance</h2>
            <div className="flex flex-col justify-center ml-3 gap-2">
              <p className="text-gray-800 text-sm">
                <strong>Name:</strong> {studentData.name}
              </p>
              <p className="text-gray-800 text-sm">
                <strong>ID:</strong> {studentData.id_number}
              </p>
              <p className="text-gray-800 text-sm">
                <strong>Course:</strong> {studentData.course}
              </p>
              <p className="text-gray-800 text-sm">
                <strong>Year:</strong> {studentData.year}
              </p>
              <p className="text-gray-800 text-sm">
                <strong>Campus:</strong> {studentData.campus}
              </p>
              <p className="text-gray-800 text-sm">
                <strong>T-Shirt Size:</strong> {studentData.shirtSize}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentAttendance;
