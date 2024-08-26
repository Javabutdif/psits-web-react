import React, { useState, useEffect, useRef } from "react";
import { getAllOrders } from "../../api/orders";
import ApproveModal from "../../components/admin/ApproveModal";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import FormButton from "../../components/forms/FormButton";
import ReactToPrint from "react-to-print";
import Receipt from "../../components/common/Receipt";
import { getPosition } from "../../authentication/Authentication";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Pending");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [rowData, setPrintData] = useState("");
  const [selectedStudent, setSelectedStudentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [shouldPrint, setShouldPrint] = useState(false);
  const componentRef = useRef();
  const printRef = useRef();
  const position = getPosition();

  const handlePrintData = (row) => {
    setPrintData(row);
    setShouldPrint(true);
    const name = row.student_name;
    const words = name.split(" ");
    let fullName = "";

    for (let i = 0; i < words.length - 1; i++) {
      fullName += words[i].charAt(0) + ".";
    }
    fullName += " " + words[words.length - 1];

    setSelectedStudentName(fullName);
  };

  const handlePrintComplete = () => {
    setPrintData("");
    setShouldPrint(false);
  };

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

  useEffect(() => {
    const filterOrders = () => {
      const result = orders.filter(
        (order) =>
          order.order_status === selectedTab &&
          (order.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            order.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.rfid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.reference_code.includes(searchTerm) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOrders(result);
    };

    filterOrders();
  }, [orders, selectedTab, searchTerm]);

  // Pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };
useEffect(() => {
    if (rowData) {
      printRef.current.click();
    }
  }, [rowData]);
  const handleApproveConfirm = () => {
    // Implement the approval logic here
    handleModalClose();
  };

  const toggleDropdown = (orderId) => {
    setOpenDropdown(openDropdown === orderId ? null : orderId);
  };

  console.log(rowData);

  console.log(printRef.current);

  return (
    <div className="p-4 pt-20">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-around bg-gray-100 p-2 rounded">
        {["Pending", "Paid"].map((tab) => (
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
              <th className="p-4">
                {selectedTab === "Pending" ? "Order ID" : "Reference Code"}
              </th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Membership</th>
              <th className="p-4">Total</th>
              <th className="p-4">Order Date</th>
              {selectedTab === "Paid" && (
                <th className="p-4">Transaction Date</th>
              )}
              <th className="p-4">Status</th>
              {selectedTab !== "Paid" && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length >= 0 ? (
              currentOrders.map((order) => (
                <React.Fragment
                  key={
                    selectedTab === "Pending" ? order._id : order.reference_code
                  }
                >
                  <tr className="border-t">
                    <td className="p-4 text-xs">
                      {selectedTab === "Pending"
                        ? order._id
                        : order.reference_code}
                    </td>
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
                    {order.order_status === "Paid" && (
                      <td className="p-4">{order.transaction_date}</td>
                    )}
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
                    {order.order_status === "Paid" && (
                      <td className="p-4">
                        <ButtonsComponent>
                          <FormButton
                            type="button"
                            text={
                              position !== "Treasurer" &&
                              position !== "Assistant Treasurer" &&
                              position !== "Auditor" &&
                              position !== "Developer"
                                ? "Not Authorized"
                                : "Print"
                            }
                            onClick={() => {
                              if (
                                position === "Treasurer" ||
                                position === "Assistant Treasurer" ||
                                position === "Auditor" ||
                                position === "Developer"
                              ) {
                                handlePrintData(order);
                              }
                            }}
                            icon={
                              <i
                                className={`fa ${
                                  position !== "Treasurer" &&
                                  position !== "Assistant Treasurer" &&
                                  position !== "Auditor" &&
                                  position !== "Developer"
                                    ? "fa-lock"
                                    : "fa-print"
                                }`}
                              ></i>
                            }
                            styles={`relative flex items-center space-x-2 px-4 py-2 rounded text-white ${
                              position !== "Treasurer" &&
                              position !== "Assistant Treasurer" &&
                              position !== "Auditor" &&
                              position !== "Developer"
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-500"
                            }`}
                            textClass="text-white"
                            whileHover={{ scale: 1.02, opacity: 0.95 }}
                            whileTap={{ scale: 0.98, opacity: 0.9 }}
                            disabled={
                              position !== "Treasurer" &&
                              position !== "Assistant Treasurer" &&
                              position !== "Auditor" &&
                              position !== "Developer"
                            }
                          />
                          <div style={{ display: "none" }}>
                            {shouldPrint && (
                              <ReactToPrint
                                trigger={() => (
                                  <button
                                    ref={printRef}
                                    style={{ display: "none" }}
                                  >
                                    Print
                                  </button>
                                )}
                                content={() => componentRef.current}
                                onAfterPrint={handlePrintComplete}
                              />
                            )}

                            <Receipt
                              ref={componentRef}
                              reference_code={rowData.reference_code}
                              course={rowData.course}
                              product_name={rowData.product_name}
                              batch={rowData.batch}
                              size={rowData.size}
                              variation={rowData.variation}
                              total={rowData.total}
                              cash={rowData.cash}
                              year={rowData.year}
                              name={selectedStudent}
                              type={"Order"}
                              admin={rowData.admin}
                              membership={
                                rowData.membership_discount
                                  ? "Discounted"
                                  : "No Discount"
                              }
                              reprint={true}
                              qty={rowData.qty}
                              itemTotal={rowData.itemTotal}
                              items={rowData.items}
                            />
                          </div>
                        </ButtonsComponent>
                      </td>
                    )}
                  </tr>
                  {openDropdown === order._id && (
                    <tr>
                      <td colSpan="10" className="p-4">
                        <ul>
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
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-4 text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Approve Modal */}
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
          membership={
            selectedOrder.membership_discount ? "Discounted" : "No Discount"
          }
          onCancel={handleModalClose}
          onSubmit={handleApproveConfirm}
          items={selectedOrder.items}
          total={selectedOrder.total}
        />
      )}
    </div>
  );
};

export default Orders;
