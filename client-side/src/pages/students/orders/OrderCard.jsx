import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { getMembershipStatusStudents } from "../../../api/students";
import { getId } from "../../../authentication/Authentication";

const OrderCard = ({ order, onCancel, onCheckboxChange, selectedOrders }) => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({ membership: "", renew: "" });

  const isChecked = selectedOrders.includes(order._id);

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancel(order._id);
  };

  const handleCardClick = () => {
    if (pathname !== "/student/orders/paid") {
      onCheckboxChange(order._id);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onCheckboxChange(order._id);
  };

  const handleViewModal = () => {
    fetchStatus();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const fetchStatus = async () => {
    const membershipStatus = await getMembershipStatusStudents(getId());
    setStatus(membershipStatus);
  };

  const statusVerify = () => {
    return (
      (status.membership === "Accepted" && status.renew === "None") ||
      status.renew === "Accepted"
    );
  };

  return (
    <>
      <motion.div
        className={`order-card bg-white shadow-md rounded-xl p-5 mb-5 border border-gray-200 flex flex-col md:flex-row items-start md:items-center space-y-5 md:space-y-0 md:space-x-5 transition-transform ${
          pathname !== "/student/orders/paid" ? "cursor-pointer" : ""
        }`}
        whileHover={pathname !== "/student/orders/paid" ? { scale: 1.03 } : {}}
        whileTap={pathname !== "/student/orders/paid" ? { scale: 0.98 } : {}}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
      >
        {pathname !== "/student/orders/paid" && (
          <div
            className="flex items-center mb-4 md:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="form-checkbox h-6 w-6"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
          </div>
        )}
        <div className="flex-shrink-0">
          <img
            src={order.items[0].imageUrl1 || "placeholder-image-url"}
            alt="Product"
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
        </div>
        <div className="flex flex-col flex-grow space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center mb-4">
              <h6 className="text-xl font-semibold text-gray-800">
                {item.product_name}
              </h6>
              <span className="text-sm text-gray-500">{order.order_date}</span>
            </div>
          ))}
          <div className="flex flex-col space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <p>
                <span className="font-semibold text-gray-900">Total:</span> ₱
                {order.total.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p
                className={`font-semibold ${
                  order.order_status === "Paid"
                    ? "text-teal-600"
                    : "text-red-600"
                }`}
              >
                <span className="text-gray-800">Status:</span>{" "}
                {order.order_status}
              </p>
              {order.order_status !== "Pending" && (
                <p>
                  <span className="font-semibold text-gray-900">Ref:</span>{" "}
                  {order.product_id}
                </p>
              )}

              {order.order_status === "Pending" && (
                <div className="flex flex-row gap-2">
                  <motion.button
                    onClick={handleViewModal} // Trigger the modal on click
                    className="bg-blue-600 text-white text-xs px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    View
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    className="bg-red-600 text-white text-xs px-5 py-2 rounded-md font-medium hover:bg-red-700 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 sm:mx-6 md:mx-8 lg:mx-12">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <p>
              <strong>Student:</strong> {order.student_name}
            </p>
            <p>
              <strong>Membership Discount:</strong>{" "}
              {order.membership_discount ? "Eligible" : "Not Eligible"}
            </p>
            <p>
              <strong>Total:</strong> ₱{order.total.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong> {order.order_status}
            </p>
            <p>
              <strong>Date:</strong> {order.order_date}
            </p>

            {/* Map through order.items */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Items:</h3>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-start mb-4"
                >
                  <div className="flex-shrink-0 mb-2 md:mb-0 md:mr-4">
                    <img
                      src={item.imageUrl1 || "placeholder-image-url"}
                      alt="Product"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <p>
                      <strong>Product Name:</strong> {item.product_name}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Price:</strong> ₱{item.price.toFixed(2)}
                    </p>
                    <p>
                      <strong>Subtotal:</strong> ₱{item.sub_total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
