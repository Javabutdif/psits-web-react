import { AiOutlineClose } from "react-icons/ai";
import { FaUserCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FormButton from "../../../components/forms/FormButton";

const ViewStudentAttendance = ({
  isVisible,
  onClose,
  studentData,
  eventId,
  eventName,
}) => {
  const navigate = useNavigate();
  if (!isVisible) return null;

  const markAsPresent = () => {
    navigate(
      `/admin/attendance/${eventId}/${eventName}/markAsPresent/${studentData.id_number}/${studentData.name}`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to render values safely
  const renderValue = (key, value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      if (key === "attendance") {
        return (
          <div className="space-y-2">
            {Object.entries(value).map(([timeSlot, timeData]) => {
              const isAttended = timeData?.attended || false;
              const timestamp = timeData?.timestamp;

              return (
                <div
                  key={timeSlot}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium capitalize text-gray-700">
                      {timeSlot}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAttended
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isAttended ? "✓ Present" : "✗ Not Attended (Yet)"}
                    </span>
                  </div>
                  {isAttended && timestamp && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(timestamp)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <div className="text-sm">
          {Object.entries(value).map(([prop, val]) => (
            <div key={prop} className="text-xs">
              {prop}: {String(val)}
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
          aria-label="Close modal"
        >
          <AiOutlineClose size={24} />
        </button>

        {/* Modal Header */}
        <h2
          id="modal-title"
          className="text-xl font-bold text-gray-900 border-b pb-2 mb-4"
        >
          Student Attendance
        </h2>

        {/* Modal Content */}
        <div id="modal-description" className="space-y-4">
          {Object.entries(studentData || {})
            .filter(
              ([key]) =>
                key !== "_id" &&
                key !== "isAttended" &&
                key !== "raffleIsRemoved" &&
                key !== "raffleIsWinner"
            ) // Exclude specific keys
            .map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium text-gray-700 capitalize">
                  {
                    key
                      .replace(/_/g, " ") // Snake case to space
                      .replace(/([a-z])([A-Z])/g, "$1 $2") // PascalCase or camelCase to space
                      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
                  }
                  :
                </span>
                <span className="text-gray-900 flex-1 ml-4 text-right">
                  {renderValue(key, value)}
                </span>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          {studentData.isAttended ? (
            <FormButton
              type="button"
              text="Attended"
              icon={<FaUserCheck size={20} />}
              styles="px-4 bg-[#22c55e] text-[#DFF6FF] cursor-not-allowed rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 flex items-center gap-2"
              textClass="text-blue-100"
              whileHover={{ scale: 1.02, opacity: 0.95 }}
              whileTap={{ scale: 0.98, opacity: 0.9 }}
            />
          ) : (
            <FormButton
              type="button"
              text="Mark as Present"
              onClick={() => {
                markAsPresent();
                onClose();
              }}
              icon={<FaUserCheck size={20} />}
              styles="px-4 bg-[#074873] text-[#DFF6FF] hover:bg-[#09618F] active:bg-[#0B729C] rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0A5C88] flex items-center gap-2"
              textClass="text-blue-100"
              whileHover={{ scale: 1.02, opacity: 0.95 }}
              whileTap={{ scale: 0.98, opacity: 0.9 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudentAttendance;
