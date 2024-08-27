import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { getMembershipStatusStudents } from "../../../api/students";
import { getId } from "../../../authentication/Authentication";

const OrderCard = ({ order, onCancel, onCheckboxChange, selectedOrders }) => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({ membership: "", renew: "" });

  const isChecked = useMemo(() => selectedOrders.includes(order._id), [selectedOrders, order._id]);
  const isNotPaidPage = pathname !== "/student/orders/paid";

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const membershipStatus = await getMembershipStatusStudents(getId());
        setStatus(membershipStatus);
      } catch (error) {
        console.error("Failed to fetch membership status:", error);
      }
    };

    fetchStatus();
  }, []);

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancel(order._id);
  };

  const handleCardClick = () => {
    if (isNotPaidPage) {
      onCheckboxChange(order._id);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onCheckboxChange(order._id);
  };

  const handleViewModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <motion.div
        className={`order-card bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 ${
          isNotPaidPage ? "cursor-pointer" : ""
        }`}
        whileHover={isNotPaidPage ? { scale: 1.03 } : {}}
        whileTap={isNotPaidPage ? { scale: 0.98 } : {}}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row relative py-4 gap-4 w-full">
          <p className="text-xs text-gray-500 absolute top-0 right-0 md:-top-1 md:left-4">{order.order_date}</p>
          {isNotPaidPage && (
            <div
              className="flex items-center mb-2 md:mb-0 md:ml-4"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 md:h-5 md:w-5 text-blue-500 border-gray-300 rounded"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </div>
          )}
          <div className="flex-shrink-0 mb-2 md:mb-0">
            <img
              src={order.items[0].imageUrl1 || "https://via.placeholder.com/100"}
              alt="Product"
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-300"
            />
          </div>
          <div className="flex flex-col flex-grow">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <h6 className="text-sm md:text-md font-semibold text-gray-800">
                  {item.product_name}
                </h6>
                <span className="text-xs md:text-sm text-gray-500">Qty: {item.quantity}</span>
              </div>
            ))}
            <div className="flex flex-col text-xs md:text-sm text-gray-700">
              <div className="flex justify-between mb-1">
                <p className="text-sm md:text-md font-semibold">
                  <span className="font-medium">Total:</span> ₱{order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p
                  className={`font-medium text-xs md:text-sm ${
                    order.order_status === "Paid" ? "text-teal-600" : "text-red-600"
                  }`}
                >
                  <span className="text-gray-600">Status:</span> {order.order_status}
                </p>
                {order.order_status !== "Pending" && (
                  <p className="text-xs md:text-sm text-gray-600">
                    <span className="font-medium">Ref:</span> {order.product_id}
                  </p>
                )}
                {order.order_status === "Pending" && (
                  <div className="w-full lg:w-auto flex-1 justify-end flex gap-2 mt-2">
                    <motion.button
                      onClick={handleViewModal}
                      className="flex-1 md:flex-none bg-blue-500 py-2 px-4 text-white text-xs md:text-sm rounded-lg font-medium hover:bg-blue-600 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      View
                    </motion.button>
                    <motion.button
                      onClick={handleCancel}
                      className="flex-1 md:flex-none bg-red-500 py-2 px-4 text-white text-xs md:text-sm rounded-lg font-medium hover:bg-red-600 transition"
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
        </div>
      </motion.div>

      {/* Modal Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <motion.div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-2">{order.order_date}</h2>
            <p className="mb-2 text-sm md:text-base">
              <strong className="font-medium">Student:</strong> {order.student_name}
            </p>
            <p className="mb-2 text-sm md:text-base">
              <strong className="font-medium">Membership Discount:</strong>{" "}
              {order.membership_discount ? "Eligible" : "Not Eligible"}
            </p>
            <p className="mb-2 text-sm md:text-base">
              <strong className="font-medium">Total:</strong> ₱{order.total.toFixed(2)}
            </p>
            <p className="mb-2 text-sm md:text-base">
              <strong className="font-medium">Status:</strong> {order.order_status}
            </p>
            <p className="mb-4 text-sm md:text-base">
              <strong className="font-medium">Date:</strong> {order.order_date}
            </p>

            {/* Map through order.items */}
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold mb-2">Items:</h3>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center mb-3"
                >
                  <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-3">
                    <img
                      src={item.imageUrl1 || "https://via.placeholder.com/100"}
                      alt="Product"
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm md:text-base">
                      <strong className="font-medium">Product Name:</strong> {item.product_name}
                    </p>
                    <p className="mb-1 text-sm md:text-base">
                      <strong className="font-medium">Quantity:</strong> {item.quantity}
                    </p>
                    <p className="mb-1 text-sm md:text-base">
                      <strong className="font-medium">Price:</strong> ₱{item.price.toFixed(2)}
                    </p>
                    <p className="mb-1 text-sm md:text-base">
                      <strong className="font-medium">Status:</strong> {order.order_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCloseModal}
              className="bg-gray-500 py-2 px-4 text-white text-sm md:text-base rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
