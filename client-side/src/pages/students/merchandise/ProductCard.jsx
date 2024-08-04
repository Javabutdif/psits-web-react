import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DEFAULT_IMAGE_URL = "/default-image.jpg";

const ProductCard = React.memo(({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (product) {
      navigate(`/student/merchandise/${product._id}`, { state: product });
    } else {
      console.error("Product is undefined");
    }
  };


  return (
    <motion.div
      className="group bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.03, boxShadow: "0px 6px 20px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      aria-label={`Product card for ${product.name}`}
    >
      <div className="relative w-full h-32">
        <motion.img
          src={product.imageUrl?.length > 0 ? product.imageUrl[0] : DEFAULT_IMAGE_URL}
          alt={product.name ? `${product.name} image` : "Default Product Image"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-800 truncate mb-1">
          {product.name}
        </h2>
        <p className="text-xs text-gray-600 mb-1">
          Stocks: <span className="font-medium text-gray-900">{product.stocks}</span>
        </p>
        <p className="text-xs text-gray-500 mb-3 truncate">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            ₱{product.price.toFixed(2)}
          </span>
          <motion.button
            onClick={handleViewDetails}
            className="bg-blue-500 text-white text-xs font-medium py-1 px-3 rounded-full hover:bg-blue-600 transition-colors duration-200"
            aria-label={`View details for ${product.name}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            View
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// Set display name for easier debugging
ProductCard.displayName = "ProductCard";

export default ProductCard;
