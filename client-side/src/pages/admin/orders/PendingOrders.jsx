import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TableComponent from "../../../components/Custom/TableComponent";
import FormButton from "../../../components/forms/FormButton";
import ApproveModal from "../../../components/admin/ApproveModal";
import { getAllOrders, cancelOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await getAllOrders(getId());
        setOrders(ordersData || []);
      } catch (error) {
        setError("Failed to fetch orders");
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setFilteredData(orders.filter((order) => order.order_status === "Pending"));
  }, [orders]);

  const handleMultipleDelete = async () => {
    try {
      await Promise.all(selectedOrders.map((orderId) => cancelOrder(orderId)));
      setOrders(orders.filter((order) => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete selected orders", error);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prevSelected) => {
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter((id) => id !== orderId);
      } else {
        return [...prevSelected, orderId];
      }
    });
  };

  const cancelOrderHandler = async (orderId) => {
    try {
      await cancelOrder(orderId);
      setOrders(orders.filter((order) => order._id !== orderId));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel order", error);
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
  const handleApproveModalClose = () => {
    setIsApproveModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.includes(id)
        ? prevSelectedOrders.filter((orderId) => orderId !== id)
        : [...prevSelectedOrders, id]
    );
  };

  const columns = [
    {
      key: "select",
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={() => {
              const newSelectAllState = !selectAll;
              setSelectAll(newSelectAllState);
              setSelectedRows(
                newSelectAllState ? filteredData.map((item) => item._id) : []
              );
              setSelectedOrders(
                newSelectAllState ? filteredData.map((item) => item._id) : []
              );
            }}
          />
        </motion.div>
      ),
      cell: (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row._id)}
            onChange={() => handleRowSelection(row._id)}
          />
        </motion.div>
      ),
    },
    {
      key: "_id",
      label: "Order ID",
      sortable: true,
      cell: (row) => <div className="text-xs text-gray-600">{row._id}</div>,
    },
    {
      key: "student_name",
      label: "Name",
      selector: (row) =>
        `${row.first_name} ${row.middle_name} ${row.last_name}`,
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div>{row.student_name}</div>
          <div className="text-gray-500">ID Number: {row.rfid}</div>
          <div className="text-gray-500">RFID: {row.rfid}</div>
        </div>
      ),
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
      key: "total",
      label: "Total Price",
      sortable: true,
    },
    {
      key: "order_date",
      label: "Order Date",
      sortable: true,
    },
    {
      key: "order_status",
      label: "Order Status",
      sortable: true,
      cell: (row) => (
        <div>
          <span
            className={`p-1 rounded text-white ${
              row.order_status === "Pending" ? "bg-red-400" : "bg-green-400"
            }`}
          >
            {row.order_status}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      cell: (row) => (
        <ButtonsComponent>
          <FormButton
            type="button"
            text="Approve"
            onClick={() => handleApproveClick(row)}
            styles="bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
            icon={<i className="fas fa-check text-sm text-base"></i>} // Changed icon
            textClass="ml-2 hidden md:inline"
            iconClass="text-sm text-base"
          />

          <FormButton
            type="button"
            text="Cancel"
            onClick={() => handleCancelOrder(row._id)}
            styles="bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
            icon={<i className="fas fa-times text-sm text-base"></i>} // Changed icon
            textClass="ml-2 hidden md:inline"
            iconClass="text-sm text-base"
          />
        </ButtonsComponent>
      ),
    },
  ];

  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setIsApproveModalOpen(true);
  };

  const handleApproveModalConfirm = async () => {
    if (selectedOrder) {
      try {
        //await approveOrder(selectedOrder._id); // Implement approveOrder in your API
        setOrders(orders.filter((order) => order._id !== selectedOrder._id));
        setIsApproveModalOpen(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error("Failed to approve order", error);
      }
    }
  };

  return (
    <div>
      <TableComponent
        data={filteredData}
        columns={columns}
        customButtons={
          selectedOrders.length > 0 && (
            <ButtonsComponent>
              {selectedRows.length > 0 && (
                <FormButton
                  type="button"
                  text="Delete All"
                  onClick={() => {
                    setIsMultipleDelete(true);
                    setIsModalOpen(true);
                  }}
                  icon={<i className="fas fa-trash-alt"></i>} // Updated icon
                  styles="flex items-center space-x-2 bg-gray-100 text-gray-800 rounded-md py-2 px-4 transition duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm" // Elegant and minimal
                  textClass="hidden"
                  whileHover={{ scale: 1.01, opacity: 0.9 }}
                  whileTap={{ scale: 0.95, opacity: 0.8 }}
                />
              )}
            </ButtonsComponent>
          )
        }
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
                className="bg-gray-300 py-1 px-3 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedOrder && (
        <ApproveModal
          reference_code={
            Math.floor(Math.random() * (999999999 - 111111111)) + 111111111
          }
          order_id={selectedOrder._id}
          id_number={selectedOrder.id_number}
          rfid={selectedOrder.rfid}
          course={selectedOrder.course}
          year={selectedOrder.year}
          name={selectedOrder.student_name}
          product_name={selectedOrder.product_name}
          batch={selectedOrder.batch}
          size={selectedOrder.sizes}
          variation={selectedOrder.variation}
          type={"Order"}
          onCancel={handleApproveModalClose}
          onSubmit={handleApproveModalConfirm}
          qty={selectedOrder.quantity}
          itemTotal={selectedOrder.total}
          total={selectedOrder.total}
        />
      )}
    </div>
  );
};

export default PendingOrders;
