import React, { useState, useEffect } from "react";
import { getOrder, cancelOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";
import OrderList from "./OrderList";
import Pagination from "../../../components/Custom/Pagination";
import SearchFilter from "../merchandise/SearchFilter";
import FormButton from "../../../components/forms/FormButton";
import FilterOptions from "../merchandise/FilterOptions";

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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

  // Handle "Check All" checkbox change
  const handleCheckAllChange = () => {
    if (isAllChecked) {
      setSelectedOrders([]);
    } else {
      const allOrderIds = currentOrders.map((order) => order._id);
      setSelectedOrders(allOrderIds);
    }
    setIsAllChecked(!isAllChecked);
  };

  // Get selected items
  const getSelectedItems = () => {
    return orders.filter((order) => selectedOrders.includes(order._id));
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
    }
  };

  // Handle multiple order cancellations
  const handleMultipleCancel = async () => {
    try {
      for (const order_id of selectedOrders) {
        await cancelOrder(order_id);
      }
      await fetchOrders(); // Refetch orders after cancellation
      setSelectedOrders([]);
    } catch (error) {
      console.error("Failed to cancel all selected orders", error);
    }
  };

  useEffect(() => {
    // If all orders on the current page are selected, check the "Check All" checkbox
    const allOrderIds = currentOrders.map((order) => order._id);
    const allChecked = allOrderIds.every((id) => selectedOrders.includes(id));
    setIsAllChecked(allChecked);
  }, [selectedOrders, currentOrders]);

  return (
    <div>
      { currentOrders.length > 0 ? (
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

      

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Cancellation</h2>
            <p className="mb-4">Are you sure you want to cancel this order?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleModalConfirm}
                className="bg-red-500 text-white py-1 px-3 rounded"
              >
                Yes
              </button>
              <button
                onClick={handleModalClose}
                className="bg-gray-300 text-gray-800 py-1 px-3 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidOrders;
