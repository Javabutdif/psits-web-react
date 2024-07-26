import React, { useState, useRef, useEffect } from "react";
import { getUser } from "../../authentication/Authentication.js";
import { showToast } from "../../utils/alertHelper";
import ReactToPrint from "react-to-print";
import Receipt from "../../components/common/Receipt.jsx";
import { approveMembership } from "../../api/admin.js";

function ApproveModal({ id_number, course, year, name, onCancel, onSubmit }) {
  const componentRef = useRef();
  const [adminName, position] = getUser();
  const [formData, setFormData] = useState({
    id_number: id_number,
    rfid: "",
    admin: adminName,
  });
  const [shouldPrint, setShouldPrint] = useState(false);
  const printRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (formData.rfid === "") {
        formData.rfid = "N/A";
      }
      //await approveMembership(formData)
      if (true) {
        showToast("success", "Student Approved");
        setShouldPrint(true);
      } else {
        showToast("error", "Internal Server Error!");
        onSubmit();
        onCancel();
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  useEffect(() => {
    if (shouldPrint && printRef.current) {
      printRef.current.click();
    }
  }, [shouldPrint]);

  const handlePrintComplete = () => {
    setShouldPrint(false);
    onSubmit();
    onCancel();
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
          <div className="p-4 border-b">
            <h5 className="text-lg font-semibold">
              {id_number} | {name}
            </h5>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <strong>RFID Number:</strong>
              </label>
              <input
                value={formData.rfid}
                name="rfid"
                className="w-full px-3 py-2 border rounded"
                type="number"
                onChange={handleChange}
                placeholder="Enter RFID Number"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <strong>Money:</strong>
              </label>
              <input
                name="money"
                className="w-full px-3 py-2 border rounded"
                type="number"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="p-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleSubmit}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "none" }}>
        <ReactToPrint
          trigger={() => <button ref={printRef}>Print</button>}
          content={() => componentRef.current}
          onAfterPrint={handlePrintComplete}
        />
        <Receipt
          ref={componentRef}
          id_number={formData.id_number}
          course={course}
          year={year}
          name={name}
          admin={adminName}
        />
      </div>
    </div>
  );
}

export default ApproveModal;
