import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markAsPresent } from "../../api/event";
import { getInformationData } from "../../authentication/Authentication";
import { searchStudentById } from "../../api/students";

const MarkAsPresent = () => {
  const { eventId, eventName, attendeeId, attendeeName } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = getInformationData();

  const fetchStudentData = async () => {
    const studentData = await searchStudentById(attendeeId);

    return studentData;
  };

  const handleMarkAsPresent = async () => {
    const student = await fetchStudentData();

    setIsLoading(true);
    try {
      const result = await markAsPresent(
        eventId,
        attendeeId,
        student.campus,
        student.course,
        student.year,
        attendeeName,
        navigate
      );
      if (result) {
        navigate(`/admin/attendance/${eventId}`);
      }
    } catch (error) {
      console.error("Error marking as present:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-center mb-4">
          Are you sure you want to mark{" "}
          <span className="font-bold">{`${attendeeId} - ${attendeeName}`}</span>{" "}
          present for the event <span className="font-bold">{eventName}</span>?
        </h2>
        <div className="flex justify-around">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center ${
              isLoading ? "opacity-75" : ""
            }`}
            onClick={handleMarkAsPresent}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Mark As Present"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAsPresent;
