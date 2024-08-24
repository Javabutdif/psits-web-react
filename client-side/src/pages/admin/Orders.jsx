import React, { useState, useEffect } from "react";
import { getAllOrders } from "../../api/orders";
import ApproveModal from "../../components/admin/ApproveModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Pending");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []);
  useEffect(() => {
    if (selectedOrder) {
      console.log(selectedOrder.items);
    }
  }, [selectedOrder]);

  const filteredOrders = orders.filter(
    (order) => order.order_status === selectedTab
  );

  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleApproveConfirm = () => {
    // Implement the approval logic here

    handleModalClose();
  };

  const toggleDropdown = (orderId) => {
    setOpenDropdown(openDropdown === orderId ? null : orderId);
  };

  return (
    <div className="p-4 pt-20">
      {/* Tabs */}
      <div className="flex justify-around bg-gray-100 p-2 rounded">
        {["Pending", "Paid", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 ${
              selectedTab === tab ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            {tab} ({orders.filter((order) => order.order_status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="mt-4 bg-white shadow rounded-md">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Membership</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Order Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
              <th className="p-4">Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="border-t">
                    <td className="p-4 text-xs">{order._id}</td>
                    <td className="p-4">
                      <span className="text-sm "> {order.student_name}</span>
                      <div>
                        <span className="text-xs">ID: {order.id_number}</span>
                      </div>
                      <div>
                        <span className="text-xs">RFID: {order.rfid}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {order.membership_discount ? "Discounted" : "No Discount"}
                    </td>
                    <td className="p-4">₱{order.total}</td>
                    <td className="p-4">{order.order_date}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          order.order_status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : order.order_status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    {order.order_status !== "Paid" && (
                      <td className="p-4">
                        <button
                          onClick={() => handleApproveClick(order)}
                          className="p-1 rounded hover:bg-green-600 text-white bg-green-500"
                        >
                          Approve
                        </button>
                      </td>
                    )}

                    <td className="p-4">
                      <button
                        onClick={() => toggleDropdown(order._id)}
                        className="text-blue-500 hover:underline"
                      >
                        {openDropdown === order._id
                          ? "Hide Items"
                          : "Show Items"}
                      </button>
                    </td>
                  </tr>
                  {openDropdown === order._id && (
                    <tr>
                      <td colSpan="8" className="p-4 bg-gray-100">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm mb-2 p-2 flex flex-row mx-3 gap-10"
                          >
                            <img src={item.imageUrl1} className="w-16 h-16" />
                            <span className="font-medium ms-2">
                              {item.product_name}
                              <div className="text-xs text-gray-500">
                                {item._id}
                              </div>
                            </span>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Price</span>
                              <span className="text-xs text-center">
                                ₱{item.price}
                              </span>
                            </div>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Quantity</span>
                              <span className="text-xs text-center">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Variation</span>
                              <span className="text-xs text-center">
                                {item.variation ? item.variation : "Null"}
                              </span>
                            </div>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Size</span>
                              <span className="text-xs text-center">
                                {item.sizes ? item.sizes : "Null"}
                              </span>
                            </div>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Batch</span>
                              <span className="text-xs text-center">
                                {item.batch ? item.batch : "Null"}
                              </span>
                            </div>
                            <div className="mx-3 mb-2 flex flex-col">
                              <span>Subtotal</span>
                              <span className="text-xs text-center">
                                ₱{item.sub_total ? item.sub_total : "Null"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ApproveModal
          reference_code={
            Math.floor(Math.random() * (999999999 - 111111111)) + 111111111
          }
          order_id={selectedOrder._id}
          id_number={selectedOrder.id_number}
          course={selectedOrder.course}
          year={selectedOrder.year}
          name={selectedOrder.student_name}
          type={"Order"}
          onCancel={handleModalClose}
          onSubmit={handleApproveConfirm}
          items={selectedOrder.items}
          total={selectedOrder.total}
        />
      )}
      {/* Pagination and Export Button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <button className="p-2 bg-gray-200 rounded-md">&lt;</button>
          <span className="mx-2">Page 1 of 10</span>
          <button className="p-2 bg-gray-200 rounded-md">&gt;</button>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Orders;
