// pages/PaidOrders.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TableComponent from '../../../components/Custom/TableComponent';

const PaidOrders = () => {
  const { orders } = useOutletContext(); // Access orders data from context

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
