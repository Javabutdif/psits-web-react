import React from "react";
import { getStudentMembershipHistory } from "../../../api/admin";
import {
  formattedDate,
  financeAndAdminConditionalAccess,
} from "../../../components/tools/clientTools";
import FormButton from "../../../components/forms/FormButton";

const StudentMembershipHistory = ({ onClose, studentId }) => {
  const [data, setData] = React.useState([]);

  const fetchMembershipHistory = async () => {
    try {
      const response = await getStudentMembershipHistory(studentId);
      console.log("response", response);
      setData(response);
    } catch (error) {
      console.error("Error fetching membership history:", error);
    }
  };
  if (data.length === 0) {
    fetchMembershipHistory();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0,0,0,0.3)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Membership History</h2>
        <ul className="space-y-2 overflow-scroll overflow-x-hidden max-h-72 p-5">
          <li className="grid grid-cols-5 space-x-4 justify-between items-center p-3 bg-gray-100 rounded-lg">
            <span className="font-medium">Reference Code</span>
            <span className="font-medium">Date</span>
            <span className="font-medium">Type</span>
            <span className="font-medium">Admin</span>
            <span className="font-medium">Action</span>
          </li>
          {data &&
            data.map((item) => (
              <li
                key={item._id}
                className="grid grid-cols-5 space-x-4 justify-between items-center p-3 bg-gray-100 rounded-lg"
              >
                <span>{item.reference_code}</span>
                <span>{formattedDate(item.date)}</span>
                <span>{item.type}</span>
                <span>{item.admin}</span>
                <span>
                  {" "}
                  <FormButton
                    type="button"
                    text="Print"
                    icon={
                      <i
                        className={`fa ${
                          financeAndAdminConditionalAccess()
                            ? "fa-print"
                            : "fa-lock"
                        }`}
                      ></i>
                    }
                    styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
                      !financeAndAdminConditionalAccess()
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#002E48]"
                    }`}
                    textClass="text-white"
                    whileHover={{ scale: 1.02, opacity: 0.95 }}
                    whileTap={{ scale: 0.98, opacity: 0.9 }}
                  />
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentMembershipHistory;
