import React, { useState, useRef, useEffect } from "react";
import { getInformationData } from "../../authentication/Authentication.js";
import { showToast } from "../../utils/alertHelper";
import ReactToPrint from "react-to-print";
import Receipt from "../../components/common/Receipt.jsx";
import { approveMembership } from "../../api/admin.js";
import { approveOrder } from "../../api/orders.js";

function ApproveModal({
  reference_code,
  order_id,
  id_number,
  course,
  year,
  name,
  product_name,
  batch,
  size,
  variation,
  type,
  rfid,
  onCancel,
  onSubmit,
  qty,
  itemTotal,
  total,
  items,
  membership,
}) {
  const componentRef = useRef();
  const user = getInformationData();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference_code: reference_code,
    id_number: id_number,
    order_id: type === "Order" ? order_id : "",
    rfid: rfid !== "" ? rfid : "",
    product_name: type === "Order" ? product_name : "",
    batch: type === "Order" ? batch : "",
    size: type === "Order" ? size : "",
    variation: type === "Order" ? variation : "",
    type: type,
    admin: user.name,
    cash: "",
    date: new Date(),
    transaction_date: new Date(),
    total: total,
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
    setIsLoading(true);
    try {
      if (formData.rfid === "") {
        formData.rfid = "N/A";
      }
      if (formData.cash === "") {
        showToast("error", "Enter cash!");
      } else if (formData.cash < formData.total) {
        showToast("error", "Cash is too low!");
      } else {
        if (type === "Membership" || type === "Renewal") {
          if (await approveMembership(formData)) {
            //showToast("success", "Student Approved");
            setShouldPrint(true);
          } else {
            showToast("error", "Internal Server Error!");
            onSubmit();
            onCancel();
          }
        } else {
          if (await approveOrder(formData)) {
            showToast("success", "Approve Order Successfully");
            setShouldPrint(true);
          } else {
            showToast("error", "Internal Server Error!");
            onSubmit();
            onCancel();
          }
        }
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
    setIsLoading(false);
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

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    // Ensure click is on the backdrop, not inside the modal content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()} // Prevents click event from bubbling to backdrop
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-navy text-white rounded-t-xl shadow-md">
            <h5 className="text-xl font-primary font-bold">
              {id_number} | {name}
            </h5>
            <button
              type="button"
              className="text-3xl leading-none hover:text-gray-200 focus:outline-none"
              onClick={onCancel}
            >
              &times;
            </button>
          </div>
          {/* Body */}
          <div className="p-4">
            <div
              className="mb-4"
              style={{ display: type !== "Membership" ? "none" : "block" }}
            >
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
                <strong>Cash: </strong>
              </label>
              <input
                value={formData.cash}
                name="cash"
                className="w-full px-3 py-2 border rounded"
                type="number"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-large font-medium text-gray-700 mb-1">
                <strong>Total: ₱{total}</strong>
              </label>
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end p-6 bg-white border-t border-gray-200 rounded-b-xl">
            <button
              type="button"
              className="px-5 py-2 text-gray-500 hover:text-gray-700 transition-all focus:outline-none rounded-md border border-gray-300 hover:border-gray-400"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 px-6 py-2 bg-gradient-to-r bg-navy text-white rounded-md hover:shadow-lg hover:from-primary hover:to-navy focus:outline-none transition-all duration-300 ease-in-out"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="relative flex items-center">
                  <div className="dot-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <style jsx>{`
                    .dot-container {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      width: 50px;
                      height: 20px;
                    }
                    .dot {
                      width: 8px;
                      height: 8px;
                      background-color: white;
                      border-radius: 50%;
                      animation: bounce 1s infinite;
                    }
                    .dot:nth-child(2) {
                      animation-delay: 0.2s;
                    }
                    .dot:nth-child(3) {
                      animation-delay: 0.4s;
                    }
                    @keyframes bounce {
                      0%,
                      100% {
                        transform: translateY(3px);
                      }
                      50% {
                        transform: translateY(-3px);
                      }
                    }
                  `}</style>
                </div>
              ) : (
                "Approve"
              )}
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
          reference_code={reference_code}
          membership={membership}
          course={course}
          product_name={formData.product_name}
          batch={formData.batch}
          size={formData.size}
          variation={formData.variation}
          total={formData.total}
          cash={formData.cash}
          year={year}
          name={name}
          type={type}
          admin={user.name}
          qty={qty}
          itemTotal={itemTotal}
          items={items}
        />
      </div>
    </div>
  );
}

export default ApproveModal;
