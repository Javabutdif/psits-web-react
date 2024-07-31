import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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
          product.imageUrl.length > 0
            ? product.imageUrl[0]
            : "/default-image.jpg"
        }
        alt={product.name}
        className="w-full h-48 object-cover" // Changed to object-cover for a cleaner look
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h2>
        <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-gray-900">
            ₱{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleViewDetails}
            className={`px-4 py-2 ${
              product.isBought ? "bg-red-500" : "bg-blue-500"
            } text-white rounded-lg hover:bg-blue-600 transition duration-300 text-sm`}
            disabled={product.isBought}
          >
            {product.isBought ? "Already Bought" : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
