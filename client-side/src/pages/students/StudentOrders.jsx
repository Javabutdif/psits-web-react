import React, { useEffect, useState } from "react";
import { getOrder, cancelOrder } from "../../api/orders";
import { getId } from "../../authentication/Authentication";

function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const cancelOrderHandler = async (order_id) => {
    try {
      await cancelOrder(order_id);
      setOrders(orders.filter((order) => order._id !== order_id));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel order", error);
    }
  };

  const handleCancelClick = (order_id) => {
    setSelectedOrderId(order_id);
    console.log(order_id);
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (selectedOrderId) {
      console.log(selectedOrderId);
      cancelOrderHandler(selectedOrderId);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
              {/* Table headers */}
              <th className="py-2 px-4 border-b">Order ID</th>
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
                {" "}
                {/* Ensure unique key */}
                <td className="py-2 text-xs px-4 border-b">{order._id}</td>
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
                  <button
                    onClick={() => handleCancelClick(order._id)}
                    className="bg-red-500 text-white py-1 px-3 rounded"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
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
}

export default StudentOrders;
