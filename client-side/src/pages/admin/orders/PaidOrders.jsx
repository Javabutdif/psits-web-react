// pages/PaidOrders.js
import React, { useState, useEffect } from 'react';
import TableComponent from '../../../components/Custom/TableComponent';
import { getAllOrders, cancelOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";

const PaidOrders = () => {
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await getAllOrders(getId());
        if (ordersData) {
          setOrders(ordersData);
        } else {
          setOrders([]);
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


  const paidOrders = orders.filter(order => order.order_status === 'Paid');
  console.log(paidOrders);

  const columns = [
    {
      key: "_id",
      label: "Order ID",
      sortable: true,
      cell: (row) => <div className="text-xs text-gray-600">{row._id}</div>,
    },
    {
      key: "product_name",
      label: "Product Name",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "sizes",
      label: "Sizes",
      sortable: true,
    },
    {
      key: "variation",
      label: "Variations",
      sortable: true,
    },
    {
      key: "batch",
      label: "Batch",
      sortable: true,
    },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
    },
    {
      key: "order_status",
      label: "Order Status",
      sortable: true,
      cell: (row) => (
        <div>
          <span className={`p-1 rounded text-white ${
            row.order_status === "Paid" ? "bg-red-400" : "bg-green-400"
          }`}>
            {row.order_status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <TableComponent
        data={paidOrders} // Corrected the data prop
        columns={columns}
      />
    </div>
  );
};

export default PaidOrders;
