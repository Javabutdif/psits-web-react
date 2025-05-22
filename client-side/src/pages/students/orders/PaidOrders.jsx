import React, { useState, useEffect } from "react";
import { getOrder, cancelOrder } from "../../../api/orders";
import { getInformationData } from "../../../authentication/Authentication";
import OrderList from "./OrderList";
import Pagination from "../../../components/Custom/Pagination";

const PaidOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5); // Number of orders to show per page
  const [selectedOrders, setSelectedOrders] = useState([]);
  const user = getInformationData();

  const pendingOrders = orders.filter((order) => order.order_status === "Paid");

  // Fetch orders from the API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await getOrder(user.id_number);
      
      setOrders(ordersData || []);
    } catch (error) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Fetch data on component mount

  // Handle individual cancel button click
  const handleCancelClick = (order_id) => {
    setSelectedOrderId(order_id);
    setIsModalOpen(true);
  };

  // Handle checkbox change
  const handleCheckboxChange = (order_id) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.includes(order_id)
        ? prevSelectedOrders.filter((id) => id !== order_id)
        : [...prevSelectedOrders, order_id]
    );
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = pendingOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(pendingOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setCurrentPage(0);
    }
  };

  return (
    <div className="h-full">
      {currentOrders.length > 0 ? (
        <div className="space-y-4 py-4">
          <OrderList
            orders={currentOrders}
            onCancel={handleCancelClick}
            onCheckboxChange={handleCheckboxChange}
            selectedOrders={selectedOrders}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen px-4">
          No product.
        </div>
      )}
    </div>
  );
};

export default PaidOrders;
