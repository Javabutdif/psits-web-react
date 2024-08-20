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
const CartItem = ({ product, onQuantityChange, onSelect }) => {
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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4 py-2 border-b border-gray-200">
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600"
          onChange={(e) => onSelect(product._id, e.target.checked)}
        />
        <img
          src={product.imageUrl1}
          alt={product.product_name}
          className="w-20 h-20 md:w-16 md:h-16 object-cover"
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-medium">{product.product_name}</h3>
          <p className="text-xs text-gray-500">{product._id}</p>
        </div>
      </div>

      <div className="text-center w-full md:w-auto">
        <p className="text-sm font-medium">{`₱${product.price}`}</p>
      </div>

      <div className="text-sm text-gray-700 w-full md:w-auto">
        {product.sizes && product.sizes.length > 0 ? (
          <div>Size: {product.sizes.join(", ")}</div>
        ) : (
          <div>No sizes available</div>
        )}
        {product.variation && product.variation.length > 0 ? (
          <div>Color: {product.variation.join(", ")}</div>
        ) : (
          <div>No color available</div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2 w-full md:w-auto">
        {product.limited && (
          <p className="text-red-600 text-sm text-center">
            This product is limited and cannot be modified.
          </p>
        )}
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-200"
            onClick={() => onQuantityChange(product._id, product.quantity - 1)}
            disabled={product.limited}
          >
            -
          </button>
          <input
            type="text"
            value={product.quantity}
            readOnly
            className="w-16 text-center border rounded-md"
          />
          <button
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-200"
            onClick={() => onQuantityChange(product._id, product.quantity + 1)}
            disabled={product.limited}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleDeleteClick}
        className="text-red-500 hover:text-red-700 w-full md:w-auto text-center"
      >
        🗑️
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

const OrderSummary = ({ subtotal, discount, total, onCheckout }) => (
  <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto sm:max-w-md">
    <h2 className="text-lg font-semibold text-center sm:text-left">
      Order Summary
    </h2>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <p>SUB TOTAL</p>
        <p>{`₱${subtotal.toFixed(2)}`}</p>
      </div>
      <div className="flex justify-between text-sm">
        <p>Discount</p>
        <p>{`-₱${discount.toFixed(2)}`}</p>
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <p>TOTAL PRICE</p>
        <p>{`₱${total.toFixed(2)}`}</p>
      </div>
    </div>
    <div className="mt-6 text-sm text-gray-600">
      <p>Claim Instructions:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Pick up your items at the office on the assigned date.</li>
        <li>Present your order number.</li>
      </ul>
    </div>
    <div className="mt-6 w-full">
      {subtotal === 0 ? (
        <div className="text-red-500 mb-2">Please select an item.</div>
      ) : null}
      <button
        onClick={onCheckout}
        className={`w-full py-2 rounded-lg ${
          subtotal === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        disabled={subtotal === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
);

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

const StudentCart = () => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [id_number, student_name, email, course, year, role, position] =
    getInformationData();
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState({ membership: "", renew: "" });
  const [orderSummaryIndicator, setOrderSummaryIndicator] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await viewCart(getId());
        if (!data || data.length === 0) {
          setProducts([]);
        } else {
          setProducts(data);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    setProducts(
      products.map((product) =>
        product._id === productId
          ? { ...product, quantity: Math.max(1, newQuantity) }
          : product
      )
    );
  };
  const fetchStatus = async () => {
    const membershipStatus = await getMembershipStatusStudents(getId());
    setStatus(membershipStatus);
  };

  const statusVerify = () => {
    return (
      (status.membership === "Accepted" && status.renew === "None") ||
      status.renew === "Accepted"
    );
  };

  const handleSelect = (productId, isSelected) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: isSelected,
    }));
    setOrderSummaryIndicator(isSelected);
  };

  const combineSelectedItems = () => {
    const selectedProducts = products.filter(
      (product) => selectedItems[product._id]
    );
    const combinedItems = selectedProducts.reduce((acc, product) => {
      const existing = acc.find((item) => item._id === product._id);
      if (existing) {
        existing.quantity += product.quantity;
      } else {
        acc.push({ ...product });
      }
      return acc;
    }, []);
    return combinedItems;
  };

  const calculateTotals = () => {
    fetchStatus();
    const combinedItems = combineSelectedItems();
    const subtotal = combinedItems.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    const discount = statusVerify() ? subtotal * 0.05 : 0; // Example fixed discount
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handleCheckout = () => {
    const consolidatedItems = combineSelectedItems();

    handleBuyNow(consolidatedItems);
  };

  const handleBuyNow = (items) => {
    setFormData({
      id_number: getId(),
      rfid: getRfid(),
      imageUrl1: items[0]?.imageUrl1,
      course: course,
      year: year,
      student_name: student_name,
      items,
      membership_discount: statusVerify() ? true : false,
      total: calculateTotals().total,
      order_date: new Date().toLocaleString(),
      order_status: "Pending",
    });
    setShowModal(true);
  };

  const confirmOrder = async () => {
    await makeOrder(formData);

    setShowModal(false);
  };

  const { subtotal, discount, total } = calculateTotals();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  return (
    <div className="flex space-x-8 p-4 bg-gray-100 min-h-screen">
      <div className="w-2/3 p-4 bg-white shadow-md rounded-lg">
        <div>
          {products.length === 0 ? (
            <div>Your cart is empty</div>
          ) : (
            products.map((product) => (
              <CartItem
                key={product._id}
                product={product}
                onQuantityChange={handleQuantityChange}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>
      {orderSummaryIndicator && (
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          total={total}
          onCheckout={handleCheckout}
        />
      )}

      <OrderModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        items={combineSelectedItems()}
        total={total}
        onConfirm={confirmOrder}
      />
    </div>
  );
};

export default StudentCart;
