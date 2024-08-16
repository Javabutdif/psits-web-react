import React, { useState, useEffect } from "react";
import { viewCart } from "../../api/students";
import { getId } from "../../authentication/Authentication";

const CartItem = ({ product }) => (
  <div className="flex items-center justify-between space-x-4 py-2">
    <div className="flex items-center space-x-2">
      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
      <img
        src={product.imageUrl1}
        alt={product.product_name}
        className="w-12 h-12"
      />
      <div>
        <h3 className="text-sm font-medium">{product.product_name}</h3>
        <p className="text-xs text-gray-500">{product._id}</p>
      </div>
    </div>
    <div className="text-center">
      <p className="text-sm font-medium">{`₱${product.price}`}</p>
     </div>
    <div className="text-sm text-gray-700">
      <p>Size: {product.sizes}</p>
      <p>Color: {product.variation}</p>
    </div>
    <div className="flex items-center space-x-2">
      <button className="px-2 py-1 text-sm border rounded">-</button>
      <input
        type="text"
        value={product.quantity}
        readOnly
        className="w-8 text-center border rounded"
      />
      <button className="px-2 py-1 text-sm border rounded">+</button>
    </div>
    <button className="text-red-500 hover:text-red-700">🗑️</button>
  </div>
);

const OrderSummary = () => (
  <div className="p-4 bg-white shadow-md rounded-lg">
    <h2 className="text-lg font-semibold">Order Summary</h2>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <p>SUB TOTAL</p>
        <p>₱750.00</p>
      </div>
      <div className="flex justify-between text-sm">
        <p>Discount</p>
        <p>-₱50.00</p>
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <p>TOTAL PRICE</p>
        <p>₱700.00</p>
      </div>
    </div>
    <div className="mt-6 text-sm text-gray-600">
      <p>Claim Instructions:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Pick up your items at the office on the assigned date.</li>
        <li>Present your order number.</li>
      </ul>
    </div>
    <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
      Proceed to Checkout
    </button>
  </div>
);

const StudentCart = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await viewCart(getId());
        setProducts(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once when the component mounts

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  return (
    <div className="flex space-x-8 p-4 bg-gray-100 min-h-screen">
      <div className="w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Items in my cart</h2>
        <div>
          {products.map((product, index) => (
            <CartItem key={index} product={product} />
          ))}
        </div>
      </div>
      <OrderSummary />
    </div>
  );
};

export default StudentCart;
