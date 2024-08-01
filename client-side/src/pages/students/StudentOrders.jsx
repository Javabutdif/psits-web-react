// pages/StudentOrders.js
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentOrderTab from '../../components/students/StudentOrderTab';

import { getOrder } from '../../api/orders';
import { getId } from '../../authentication/Authentication';

const StudentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await getOrder(getId());
        if (ordersData) {
          setOrders(ordersData);
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

  return (
    <div>
      <StudentOrderTab />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Outlet context={{ orders, setOrders }} />
      )}
    </div>
  );
};

export default StudentOrders;

