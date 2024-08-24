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
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative w-full h-48"> {/* Fixed height for all images */}
        <motion.img
          src={product.imageUrl?.[0] || DEFAULT_IMAGE_URL}
          alt={product.name || "Product"}
          className="w-full h-full object-cover"
          loading="lazy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-800 truncate mb-2">
          {product.name}
        </h2>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-900">
            ₱{product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {product.stocks}
          </span>
        </div>
        <motion.button
          onClick={handleViewDetails}
          className="w-full bg-[#002E48] text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-[#013e61] transition-colors duration-200"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          View
        </motion.button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;