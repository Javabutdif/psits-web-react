import React, { useState, useEffect } from 'react';
import { getOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";
import Pagination from '../../../components/Custom/Pagination';
import OrderList from './OrderList';

const PaidOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5); // Number of orders to show per page


  const paidOrders = orders.filter(order => order.order_status === 'Paid');

  console.log(paidOrders)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await getOrder(getId());
        if (ordersData) {
          setOrders(ordersData.filter(order => order.status === 'Paid')); // Filter for paid orders
        } else {
          setOrders([]); // Set to empty array if data is null
        }
      } catch (error) {
        setError("Failed to fetch orders");
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);



  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = paidOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(paidOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  return (
    <div>
         <OrderList 
            orders={currentOrders} 
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
    </div>
  );
}

export default PaidOrders;
