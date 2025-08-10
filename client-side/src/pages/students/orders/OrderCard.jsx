import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import { getInformationData } from "../../../authentication/Authentication";
import { formattedDate } from "../../../components/tools/clientTools";

const OrderCard = ({ order, onCancel, onCheckboxChange, selectedOrders }) => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = getInformationData();

  const isChecked = useMemo(
    () => selectedOrders.includes(order._id),
    [selectedOrders, order._id]
  );
  const isNotPaidPage = pathname !== "/student/orders/paid";

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
        className={`order-card bg-white shadow-sm rounded-md p-3 mb-3 border border-neutral-medium flex flex-col md:flex-row items-start md:items-center ${
          isNotPaidPage ? "cursor-pointer" : ""
        }`}
        whileHover={isNotPaidPage ? { scale: 1.02 } : {}}
        whileTap={isNotPaidPage ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row relative gap-3 w-full">
          <p className="text-xs text-neutral-dark absolute top-0 right-0">
            {formattedDate(order.order_date)}
          </p>
          {isNotPaidPage && (
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="form-checkbox h-3 w-3 text-primary border-neutral-medium rounded"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </div>
          )}
          <div className="flex-shrink-0">
            {order?.items?.[0]?.imageUrl1 ? (
              <img
                src={order.items[0].imageUrl1}
                alt="Product"
                className="w-16 h-16 object-cover rounded-md border border-neutral-medium"
              />
            ) : (
              <img
                src="/empty.webp"
                alt="Product"
                className="w-16 h-16 object-cover rounded-md border border-neutral-medium"
              />
            )}
          </div>
          <div className="flex flex-col flex-grow">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="relative flex justify-between items-center mb-1"
              >
                <h6 className="text-sm font-medium text-gray-800">
                  {item.product_name}
                </h6>

                <span className="absolute right-3 top-5 text-xs text-neutral-dark">
                  Qty: {item.quantity}
                </span>
              </div>
            ))}
            <div className="text-xs text-gray-700">
              <div className="flex justify-between mb-1">
                <p className="font-medium">
                  <span className="font-medium">Total:</span> ₱
                  {order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p
                  className={`font-medium ${
                    order.order_status === "Paid"
                      ? "text-teal-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.order_status}
                </p>

                {(order.order_status === "Pending" ||
                  order.order_status === "Paid") && (
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      onClick={handleViewModal}
                      className="bg-primary py-1 px-3 text-white text-xs rounded-md font-medium hover:bg-blue-600 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      View
                    </motion.button>
                    {order.order_status === "Pending" && (
                      <motion.button
                        onClick={handleCancel}
                        className="bg-secondary py-1 px-3 text-white text-xs rounded-md font-medium hover:bg-gray-600 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        Cancel
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <motion.div
            className="bg-white rounded-md p-4 w-full max-w-sm mx-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-md font-medium mb-2">
              {formattedDate(order.order_date)}
            </h2>
            {order.order_status === "Paid" && (
              <p className="mb-2 text-xs">
                <strong className="font-medium">Reference Code:</strong>{" "}
                <strong>{order.reference_code}</strong>
              </p>
            )}

            <p className="mb-2 text-xs">
              <strong className="font-medium">Student:</strong>{" "}
              {order.student_name}
            </p>
            <p className="mb-2 text-xs">
              <strong className="font-medium">Membership Discount:</strong>{" "}
              {order.membership_discount ? "Eligible" : "Not Eligible"}
            </p>
            <p className="mb-2 text-xs">
              <strong className="font-medium">Total:</strong> ₱
              {order.total.toFixed(2)}
            </p>
            <p className="mb-2 text-xs">
              <strong className="font-medium">Status:</strong>{" "}
              {order.order_status}
            </p>
            <p className="mb-4 text-xs">
              <strong className="font-medium">Date:</strong>{" "}
              {formattedDate(order.order_date)}
            </p>

            {/* Map through order.items */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Items:</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center mb-3">
                  <div className="flex-shrink-0 mr-3">
                    {item?.imageUrl1 ? (
                      <img
                        src={item.imageUrl1}
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-md border border-neutral-medium"
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/80"
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-md border border-neutral-medium"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs mb-1">
                      <strong className="font-medium">Product Name:</strong>{" "}
                      {item.product_name}
                    </p>
                    <p className="text-xs mb-1">
                      <strong className="font-medium">Quantity:</strong>{" "}
                      {item.quantity}
                    </p>
                    {item.batch !== null && item.batch !== "" && (
                      <p className="text-xs mb-1">
                        <strong className="font-medium">Batch:</strong>{" "}
                        {item.batch}
                      </p>
                    )}
                    {item.sizes !== null && item.sizes !== "" && (
                      <p className="text-xs mb-1">
                        <strong className="font-medium">Size:</strong>{" "}
                        {item.sizes}
                      </p>
                    )}
                    <p className="text-xs mb-1">
                      <strong className="font-medium">Price:</strong> ₱
                      {item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCloseModal}
              className="bg-gray-500 py-1 px-3 text-white text-xs rounded-md font-medium hover:bg-gray-600 transition"
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
