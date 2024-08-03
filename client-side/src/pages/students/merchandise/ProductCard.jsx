import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrder } from "../../../api/orders";
import { getId } from "../../../authentication/Authentication";

const DEFAULT_IMAGE_URL = "/default-image.jpg";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [limited, setLimited] = useState("");

  useEffect(() => {
    const fetchAndSetOrderId = async () => {
      try {
        const orders = await getOrder(getId());
        const order = orders.find((order) => order.product_id === product._id);
        if (order) {
          setOrderId(order.product_id);
          setLimited(order.limited); // Ensure `order.limited` matches your actual API response
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchAndSetOrderId();
  }, [product._id]);

  const handleViewDetails = () => {
    if (product) {
      navigate(`/student/merchandise/${product._id}`, { state: product });
    } else {
      console.error("Product is undefined");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img
        src={
          product.imageUrl.length > 0 ? product.imageUrl[0] : DEFAULT_IMAGE_URL
        }
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h2>
        <p className="text-sm">Stocks: {product.stocks}</p>
        <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-gray-900">
            ₱{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleViewDetails}
            className={`px-4 py-2 ${
              orderId === product._id && limited ? "bg-red-500" : "bg-blue-500"
            } text-white rounded-lg ${
              orderId === product._id && limited
                ? "hover:bg-red-600"
                : "hover:bg-blue-600"
            } transition duration-300 text-sm`}
            disabled={orderId === product._id || product.stocks === 0}
          >
            {orderId === product._id && limited === "True"
              ? "Already Bought"
              : product.stocks === 0
              ? "Out of Stock"
              : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
