import React, { useEffect, useState } from "react";
import { getAllOrders, cancelOrder } from "../../api/orders";
import ApproveModal from "../../components/admin/ApproveModal";
import { getId } from "../../authentication/Authentication";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

  const cancelOrderHandler = async (order_id) => {
    try {
      await cancelOrder(order_id);
      setOrders(orders.filter((order) => order._id !== order_id));
      setIsCancelModalOpen(false);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Failed to cancel order", error);
    }
  };

  const handleCancelClick = (order_id) => {
    setSelectedOrderId(order_id);
    setIsCancelModalOpen(true);
  };

  const handleCancelModalConfirm = () => {
    if (selectedOrderId) {
      cancelOrderHandler(selectedOrderId);
    }
  };

  const handleApproveModalClose = () => {
    setIsApproveModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setSelectedOrderId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Orders</h1>
      {orders.length === 0 ? (
        <div>No orders found</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Id Number</th>
              <th className="py-2 px-4 border-b">RFID</th>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Sizes</th>
              <th className="py-2 px-4 border-b">Variations</th>
              <th className="py-2 px-4 border-b">Batch</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Total</th>
              <th className="py-2 px-4 border-b">Order Date</th>
              <th className="py-2 px-4 border-b">Order Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="py-2 text-xs px-4 border-b">{order._id}</td>
                <td className="py-2 px-4 border-b text-sm">
                  {order.student_name}
                </td>
                <td className="py-2 px-4 border-b">{order.id_number}</td>
                <td className="py-2 px-4 border-b">{order.rfid}</td>
                <td className="py-2 px-4 border-b">{order.product_name}</td>
                <td className="py-2 px-4 border-b">{order.category}</td>
                <td className="py-2 px-4 border-b">{order.sizes}</td>
                <td className="py-2 px-4 border-b">{order.variation}</td>
                <td className="py-2 px-4 border-b">{order.batch}</td>
                <td className="py-2 px-4 border-b">{order.quantity}</td>
                <td className="py-2 px-4 border-b">{order.total}</td>
                <td className="py-2 px-4 border-b">{order.order_date}</td>
                <td className="py-2 px-4 border-b">{order.order_status}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleApproveClick(order)}
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCancelClick(order._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedOrder && (
        <ApproveModal
          reference_code={
            Math.floor(Math.random() * (999999999 - 111111111)) + 111111111
          }
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

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Cancellation</h2>
            <p className="mb-4">Are you sure you want to cancel this order?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelModalConfirm}
                className="bg-red-500 text-white py-1 px-3 rounded"
              >
                Yes
              </button>
              <button
                onClick={handleCancelModalClose}
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

export default Orders;
