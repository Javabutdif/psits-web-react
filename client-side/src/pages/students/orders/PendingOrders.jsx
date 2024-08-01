import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import TableComponent from '../../../components/Custom/TableComponent';
import FormButton from '../../../components/forms/FormButton';
import { cancelOrder } from "../../../api/orders";

const PendingOrders = () => {
  const { orders, setOrders } = useOutletContext(); // Access orders data from context
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  if (!Array.isArray(orders)) {
    console.error('Orders data is not an array:', orders);
    return <div>Invalid orders data</div>;
  }

  const pendingOrders = orders.filter(order => order.order_status === 'Pending');

  const handleMultipleDelete = async () => {
    try {
      // Implement your multiple deletion logic here
      await Promise.all(selectedOrders.map(orderId => cancelOrder(orderId)));
      setOrders(orders.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete selected orders', error);
    }
  };
  
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prevSelected => {
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter(id => id !== orderId);
      } else {
        return [...prevSelected, orderId];
      }
    });
  };

  const cancelOrderHandler = async (order_id) => {
    try {
      await cancelOrder(order_id);
      setOrders(orders.filter(order => order._id !== order_id));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel order', error);
    }
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsMultipleDelete(false);
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (isMultipleDelete) {
      handleMultipleDelete();
    } else if (selectedOrderId) {
      cancelOrderHandler(selectedOrderId);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: "select",
      label: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(row._id)}
          onChange={() => handleSelectOrder(row._id)}
        />
      ),
    },
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
            row.order_status === "Pending" ? "bg-red-400" : "bg-green-400"
          }`}>
            {row.order_status}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      cell: (row) => (
        <FormButton
          type="button"
          text="Cancel"
          onClick={() => handleCancelOrder(row._id)}
          styles="bg-red-100 text-blue-800 hover:bg-blue-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
          icon={<i className="fas fa-trash text-sm text-base"></i>}
          textClass="ml-2 hidden md:inline"
          iconClass="text-sm text-base"
        />
      ),
    },
  ];

  return (
    <div>
      <TableComponent
        data={pendingOrders}
        columns={columns}
        customButtons={selectedOrders.length > 0 && (
          <FormButton
            type="button"
            text="Delete Selected Orders"
            onClick={() => {
              setIsMultipleDelete(true);
              setIsModalOpen(true);
            }}
            styles="bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
            icon={<i className="fas fa-trash text-sm text-base"></i>}
            textClass="ml-2 md:inline"
            iconClass="text-sm text-base"
          />
        )}
      />
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Cancellation</h2>
            <p className="mb-4">
              {isMultipleDelete
                ? `Are you sure you want to cancel ${selectedOrders.length} orders?`
                : `Are you sure you want to cancel this order?`}
            </p>
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
