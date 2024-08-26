import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, isLoading }) => {
  return (
    <div className="py-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: products.length }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 p-4 rounded-md shadow animate-pulse"
            >
              <div className="h-32 bg-gray-300 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-300 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-300 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-600 text-center mt-4">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;