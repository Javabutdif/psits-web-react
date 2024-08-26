import React, { useState, useEffect } from "react";
import { viewCart, deleteItem } from "../../api/students";
import { makeOrder } from "../../api/orders";
import { getId, getRfid } from "../../authentication/Authentication";
import { getInformationData } from "../../authentication/Authentication";
import { getMembershipStatusStudents } from "../../api/students";

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="text-lg font-bold">Confirm Deletion</h2>
        <p>Are you sure you want to delete this item?</p>
        <div className="flex space-x-4 mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderModal = ({ isVisible, total, onClose, items, onConfirm }) => {
  return isVisible ? (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Review Your Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={item.imageUrl1}
                  alt={item.product_name}
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-sm font-medium">{item.product_name}</h3>
                  <p className="text-xs text-gray-500">{`₱${item.price}`}</p>
                </div>
              </div>
              <p className="text-sm">{item.quantity}</p>
              <p className="text-sm">{`₱${(item.price * item.quantity).toFixed(
                2
              )}`}</p>
            </div>
          ))}
          <div className="flex justify-between font-semibold mt-4">
            <span>Total Price:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
const OrderSummary = ({
  subTotal,
  discountedTotal,
  onCheckout,
  totalPrice,
}) => {
  return (
    <div className="row-start-2 col-span-full w-full lg:row-start-1 lg:col-start-4 lg:col-span-2 lg:max-w-sm mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-3 text-center sm:text-left">
        Order Summary
      </h2>
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between mb-1 text-sm sm:text-base">
          <span className="font-medium">SUB TOTAL</span>
          <span className="font-medium">₱{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1 text-sm sm:text-base">
          <span className="font-medium">Discount</span>
          <span className="text-red-500">-₱{discountedTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-3 border-t border-gray-200 pt-1 text-sm sm:text-base">
          <span className="font-semibold text-base">TOTAL PRICE</span>
          <span className="font-semibold text-base">
            ₱{totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="mt-4">
          <h3 className="text-base font-semibold mb-1">Claim Instructions:</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base">
            <li>Pick up your items at the office on the assigned date.</li>
            <li>Present your order number.</li>
          </ul>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={onCheckout} // Should be a function to handle showing the modal
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

const CartItem = ({
  product,
  onQuantityChange,
  onSelect,
  onCheckboxChange,
}) => {
  const { imageUrl1, product_id, product_name, price, quantity, selected } =
    product;
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const data = {
      id_number: getId(),
      cart_id: product._id,
    };
    await deleteItem(data);
    setModalOpen(false);
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start p-4 border-b border-gray-200 bg-white shadow-sm rounded-lg mb-4">
      {/* checkbox   */}
      {/* <div className="flex-shrink-0 flex items-center mr-4 mb-4 sm:mb-0">
        <input
          type="checkbox"
          checked={selected || false}
          onChange={() => onCheckboxChange(product_id)}
          className="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
        />
      </div> */}
      <div className="flex-shrink-0 w-full sm:w-1/4 mb-4 sm:mb-0">
        <img
          src={imageUrl1}
          alt={product_name}
          className="object-cover w-full h-24 sm:h-32 rounded-md"
        />
      </div>
      <div className="flex-1 sm:ml-4">
        <h4 className="text-base sm:text-lg font-semibold text-gray-800">
          {product_name}
          <span className="block text-sm text-gray-600">ID: {product_id}</span>
        </h4>
        <p className="text-sm sm:text-base font-medium text-gray-700">
          ₱{price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center mt-4 sm:mt-0 sm:ml-4 space-x-2 sm:space-x-4">
        <button
          className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg p-2 transition duration-150 ease-in-out text-xs sm:text-sm"
          onClick={() =>
            onQuantityChange(product_id, Math.max(quantity - 1, 1))
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h14"
            />
          </svg>
        </button>
        <span className="text-xs sm:text-base font-medium text-gray-800">
          {quantity}
        </span>
        <button
          className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg p-2 transition duration-150 ease-in-out text-xs sm:text-sm"
          onClick={() => onQuantityChange(product_id, quantity + 1)}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v14m7-7H5"
            />
          </svg>
        </button>
        <button
          className="ml-0 sm:ml-4 text-red-600 hover:text-red-800 font-medium transition duration-150 ease-in-out text-xs sm:text-sm"
          onClick={handleDeleteClick}
        >
          Remove
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
const StudentCart = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ membership: "", renew: "" });
  const [showModal, setShowModal] = useState(false); // This manages modal visibility
  const [id_number, student_name, email, course, year, role, position] =
    getInformationData();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await viewCart(getId());
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    const fetchStatus = async () => {
      try {
        const membershipStatus = await getMembershipStatusStudents(getId());
        setStatus(membershipStatus);
      } catch (error) {
        setError(error.message || "Failed to fetch membership status");
      }
    };

    fetchProducts();
    fetchStatus();
  }, []);

  const statusVerify = () => {
    return (
      (status.membership === "Accepted" && status.renew === "None") ||
      status.renew === "Accepted"
    );
  };

  const handleQuantityChange = (id, newQuantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_id === id
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };
  const handleCheckout = () => {
    setShowModal(true);
    setFormData({
      id_number: getId(),
      rfid: getRfid(),
      course: course,
      year: year,
      student_name: student_name,
      items: products,
      membership_discount: statusVerify(),
      total: totalPrice,
      order_date: new Date().toLocaleString(),
      order_status: "Pending",
    });
  };

  const confirmOrder = async () => {
    await makeOrder(formData);

    setShowModal(false);
  };

  console.log(formData);
  const handleRemove = (id) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.product_id !== id)
    );
  };

  const handleCheckboxChange = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_id === id
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const subTotal = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = statusVerify() ? 0.05 : 0;
  const discountedTotal = subTotal * discount;
  const totalPrice = subTotal - discountedTotal;

  return (
    <div className="grid min-h-main-md grid-rows-[1fr_auto] grid-cols-3 xl:grid-cols-4 lg:grid-rows-2 lg:flex-row items-start gap-4 pb-4">
      <div className="relative row-start-1 col-span-full lg:col-span-3 lg:row-span-2 h-full bg-white">
        <div className="absolute inset-0 overflow-y-auto p-4">
          {products.length === 0 ? (
            <p className="text-center text-gray-700">Your cart is empty.</p>
          ) : (
            products.map((product) => (
              <CartItem
                key={product.product_id}
                product={product}
                onQuantityChange={handleQuantityChange}
                onSelect={handleRemove}
                onCheckboxChange={handleCheckboxChange}
              />
            ))
          )}
        </div>
      </div>

      <OrderSummary
        subTotal={subTotal}
        discountedTotal={discountedTotal}
        onCheckout={handleCheckout}
        totalPrice={totalPrice}
      />

      <OrderModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        items={products}
        total={totalPrice}
        onConfirm={confirmOrder}
      />
    </div>
  );
};

export default StudentCart;
