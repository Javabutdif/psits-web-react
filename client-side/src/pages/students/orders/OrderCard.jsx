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
      className={`order-card bg-gray-50 shadow-sm rounded-sm p-3 mb-2 border border-gray-200 flex flex-row items-center space-x-3 ${
        pathname !== "/student/orders/paid" ? "cursor-pointer" : ""
      }`}
      whileHover={pathname !== "/student/orders/paid" ? { scale: 1.001 } : {}}
      whileTap={pathname !== "/student/orders/paid" ? { scale: 0.99 } : {}}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {pathname !== "/student/orders/paid" && (
        <div
          className="flex items-center mr-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
      <div className="flex h-full justify-center items-center">
        <img
          src={order.imageUrl1}
          alt="Product"
          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
        />
      </div>
      <div className="flex flex-col flex-grow space-y-1">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-sm font-medium text-gray-800">
            {order.product_name}
          </h2>
          <span className="text-xs text-gray-500">
            {order.transaction_date}
          </span>
        </div>
        <div className="flex flex-col space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <p>
              <span className="font-medium text-gray-900">Qty:</span>{" "}
              {order.quantity}
            </p>

            <p>
              <span className="font-medium text-gray-900">Total:</span> ₱
              {order.total.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p
              className={`font-medium ${
                order.order_status === "Paid" ? "text-teal-500" : "text-red-500"
              }`}
            >
              <span className="text-gray-800">Status:</span>{" "}
              {order.order_status}
            </p>
            <p>
              <span className="font-medium text-gray-900">Ref:</span>{" "}
              {order.reference_code}
            </p>
            {order.order_status === "Pending" && (
              <motion.button
                onClick={handleCancel}
                className="bg-red-500 text-white text-xs px-3 py-1 rounded-md font-medium hover:bg-red-600 transition"
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
