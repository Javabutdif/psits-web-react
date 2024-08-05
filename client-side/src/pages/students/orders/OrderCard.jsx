import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const OrderCard = ({ order, onCancel, onCheckboxChange, selectedOrders }) => {
  const { pathname } = useLocation();
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

  return (
    <motion.div
      className={`order-card bg-white shadow-md rounded-xl p-5 mb-5 border border-gray-200 flex flex-row items-start space-x-5 transition-transform ${
        pathname !== "/student/orders/paid" ? "cursor-pointer" : ""
      }`}
      whileHover={pathname !== "/student/orders/paid" ? { scale: 1.03 } : {}}
      whileTap={pathname !== "/student/orders/paid" ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {pathname !== "/student/orders/paid" && (
        <div
          className="flex items-center mr-4"
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
          src={order.imageUrl1 || "placeholder-image-url"} // Provide a default image if none is available
          alt="Product"
          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
        />
      </div>
      <div className="flex flex-col flex-grow space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {order.product_name}
          </h2>
          <span className="text-sm text-gray-500">
            {order.order_date}
          </span>
        </div>
        <div className="flex flex-col space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <p>
              <span className="font-semibold text-gray-900">Qty:</span>{" "}
              {order.quantity}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Total:</span> ₱
              {order.total.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col space-y-1">
            <p>
              <span className="font-semibold text-gray-900">Student:</span>{" "}
              {order.student_name}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Batch:</span>{" "}
              {order.batch}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p
              className={`font-semibold ${
                order.order_status === "Paid" ? "text-teal-600" : "text-red-600"
              }`}
            >
              <span className="text-gray-800">Status:</span>{" "}
              {order.order_status}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Ref:</span>{" "}
              {order.product_id}
            </p>
            {order.order_status === "Pending" && (
              <motion.button
                onClick={handleCancel}
                className="bg-red-600 text-white text-xs px-5 py-2 rounded-md font-medium hover:bg-red-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
