import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE_URL = '/default-image.jpg';

const ProductCard = ({ product, orderId, limited }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (product && !(orderId === product._id && limited === 'True')) {
      navigate(`/student/merchandise/${product._id}`, { state: product });
    }
  };

  const isAlreadyBought = orderId === product._id && limited === 'True';
  const isOutOfStock = product.stocks === 0;

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className="bg-white shadow-sm rounded-sm overflow-hidden">
      <div className="bg-slate-50">
        <img
          src={product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[0] : DEFAULT_IMAGE_URL}
          alt={product.name}
          className="aspect-video w-full md:h-44 object-contain object-center"
        />
      </div>
      <div className="p-4">
        <h2 className="flex flex-col text-lg font-semibold text-gray-800 truncate">
          {product.name}
          <span className=" text-xs text-gray-500">
            Stocks: {product.stocks}
          </span>  
        </h2>
        <p className="text-gray-600 mt-2 h-10 text-sm">{truncateText(product.description, 50)}</p>
        <div className="flex flex-col 2xl:flex-row items-center justify-between   space-y-2 xl:space-y-0 mt-4">
          <span className="self-start 2xl:self-center text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</span>
          <button
            onClick={handleViewDetails}
            className={`self-stretch px-4 py-2 ${isAlreadyBought ? 'bg-red-400' : isOutOfStock ? 'bg-gray-400' : 'bg-teal-500'} text-white rounded-sm ${isAlreadyBought ? 'hover:bg-red-500' : isOutOfStock ? 'hover:bg-gray-500' : 'hover:bg-teal-600'} transition duration-300 text-sm`}
            disabled={isAlreadyBought || isOutOfStock}
          >
            {isAlreadyBought ? 'Already Bought' : isOutOfStock ? 'Out of Stock' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
