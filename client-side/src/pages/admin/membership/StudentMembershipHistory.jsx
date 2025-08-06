import React from "react";
import { getStudentMembershipHistory } from "../../../api/admin";
import {
  formattedDate,
  financeAndAdminConditionalAccess,
} from "../../../components/tools/clientTools";
import FormButton from "../../../components/forms/FormButton";
import ReactToPrint from "react-to-print";
import { handlePrintDataPos } from "../../../components/tools/clientTools";
import Receipt from "../../../components/common/Receipt";

const StudentMembershipHistory = ({ onClose, studentId }) => {
  const [data, setData] = React.useState([]);
  const [shouldPrint, setShouldPrint] = React.useState(false);
  const [selectedStudent, setSelectedStudentName] = React.useState("");

  const [rowData, setPrintData] = React.useState("");

  const componentRef = React.useRef();
  const printRef = React.useRef();

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

  const handlePrintData = (row) => {
    setPrintData(row);
    setShouldPrint(true);

    setSelectedStudentName(handlePrintDataPos(row.name));
  };

  React.useEffect(() => {
    if (rowData) {
      printRef.current.click();
    }
  }, [rowData]);

  const handlePrintComplete = () => {
    setPrintData("");
  };

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
            <span className="font-medium">Manage</span>
            <span className="font-medium">Action</span>
          </li>
          {data && data.length > 0 ? (
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
                    onClick={() => {
                      if (financeAndAdminConditionalAccess()) {
                        handlePrintData(item);
                      }
                    }}
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
            ))
          ) : (
            <li className="text-center text-gray-500">
              No membership history found.
            </li>
          )}
        </ul>
      </div>
      <div style={{ display: "none" }}>
        {shouldPrint && rowData && (
          <ReactToPrint
            trigger={() => (
              <button ref={printRef} style={{ display: "none" }}>
                Print
              </button>
            )}
            content={() => componentRef.current}
            onAfterPrint={handlePrintComplete}
          />
        )}
        {shouldPrint && rowData && (
          <Receipt
            ref={componentRef}
            reference_code={rowData.reference_code}
            course={rowData.course}
            product_name={rowData.product_name}
            batch={rowData.batch}
            size={rowData.size}
            variation={rowData.variation}
            total={50}
            cash={rowData.cash}
            year={rowData.year}
            name={selectedStudent}
            type={rowData.type}
            admin={rowData.admin}
            reprint={true}
            qty={1}
            itemTotal={50}
          />
        )}
      </div>
    </div>
  );
};

export default StudentMembershipHistory;
