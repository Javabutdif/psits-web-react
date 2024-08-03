import React, { useState, useEffect } from 'react';
import { getOrder, cancelOrder } from '../../../api/orders';
import { getId } from '../../../authentication/Authentication';
import OrderList from './OrderList';
import Pagination from '../../../components/Custom/Pagination';
import SearchFilter from '../merchandise/SearchFilter';
import FormButton from '../../../components/forms/FormButton';
import FilterOptions from '../merchandise/FilterOptions';

const PendingOrders = () => {
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


  // Filter pending orders
  const pendingOrders = orders.filter(order => order.order_status === 'Pending');

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
      setError('Failed to fetch orders');
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle individual order cancellation
  const cancelOrderHandler = async (order_id) => {
    try {
      await cancelOrder(order_id);
      setOrders(orders.filter((order) => order._id !== order_id));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel order", error);
    }
  };

  // Handle individual cancel button click
  const handleCancelClick = (order_id) => {
    setSelectedOrderId(order_id);
    setIsModalOpen(true);
  };

  // Confirm cancellation of the selected order
  const handleModalConfirm = () => {
    if (selectedOrderId) {
      cancelOrderHandler(selectedOrderId);
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
      const allOrderIds = currentOrders.map(order => order._id);
      setSelectedOrders(allOrderIds);
    }
    setIsAllChecked(!isAllChecked);
  };

  // Get selected items
  const getSelectedItems = () => {
    return orders.filter(order => selectedOrders.includes(order._id));
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = pendingOrders.slice(indexOfFirstOrder, indexOfLastOrder);

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
      setOrders(orders.filter((order) => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
    } catch (error) {
      console.error('Failed to cancel all selected orders', error);
    }
  };

  useEffect(() => {
    // If all orders on the current page are selected, check the "Check All" checkbox
    const allOrderIds = currentOrders.map(order => order._id);
    const allChecked = allOrderIds.every(id => selectedOrders.includes(id));
    setIsAllChecked(allChecked);
  }, [selectedOrders, currentOrders]);

  return (
    <div>
        <div className="space-y-4 py-4">
          {/* <SearchFilter 
             searchQuery={searchQuery}
             handleSearchChange={handleSearchChange}
          /> */}
          {selectedOrders.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={handleCheckAllChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Select All</label>
              </div>
              <FormButton
                type="button"
                text="Cancel All Orders"
                icon={<i className="fas fa-trash-alt text-sm"></i>}
                styles="space-x-1 bg-red-500 text-white rounded py-1 px-2 text-sm transition duration-150 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                textClass="text-sm hidden md:inline-block"
                whileHover={{ scale: 1.01, opacity: 0.9 }}
                whileTap={{ scale: 0.95, opacity: 0.8 }}
                onClick={handleMultipleCancel}
              />
            </div>
          )}

         
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

export default PendingOrders;
