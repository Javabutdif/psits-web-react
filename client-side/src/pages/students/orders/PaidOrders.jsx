import React, { useState, useEffect } from "react";
import { getOrder, cancelOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";
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
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingOrders = orders.filter((order) => order.order_status === "Paid");

  // Fetch orders from the API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await getOrder(getId());
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

  // Confirm cancellation of the selected order
  const handleModalConfirm = async () => {
    if (selectedOrderId) {
      try {
        await cancelOrder(selectedOrderId);
        await fetchOrders(); // Refetch orders after cancellation
        setIsModalOpen(false);
        setSelectedOrderId(null);
      } catch (error) {
        console.error("Failed to cancel the order", error);
      }
    }
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
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
        <div>No Product.</div>
      )}
    </div>
  );
};

export default PaidOrders;
