import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getOrder } from '../../../api/orders';
import { getId } from '../../../authentication/Authentication';

// Skeleton Loader Component
const SkeletonLoader = ({ count }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white shadow-sm overflow-hidden">
        <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
          <div className="bg-gray-200 h-6 w-3/4 mb-2 animate-pulse"></div>
          <div className="bg-gray-200 h-4 w-1/2 mb-2 animate-pulse"></div>
          <div className="bg-gray-200 h-4 w-2/3 mb-2 animate-pulse"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="bg-gray-200 h-6 w-1/4 animate-pulse"></div>
            <div className="bg-gray-200 h-6 w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductList = ({ products, isLoading }) => {
  const [ordersData, setOrdersData] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const orders = await getOrder(getId());
        const ordersMap = orders.reduce((acc, order) => {
          acc[order.product_id] = { limited: order.limited };
          return acc;
        }, {});
        setOrdersData(ordersMap);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Display skeleton loader if either products or orders data are loading
  if (isLoading || loadingOrders) {
    // Use a count of 4 if products.length is 0 or undefined to display default number of skeletons
    return <SkeletonLoader count={products.length || 4} />;
  }

  // Display message if no products are available
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-4">
        <p className="text-gray-600">No products available</p>
      </div>
    );
  }

  // Render list of product cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-4">
      {products.map((product) => {
        const order = ordersData[product._id] || {};
        return (
          <ProductCard
            key={product._id}
            product={product}
            orderId={product._id}
            limited={order.limited || ''}
            isLoading={loadingOrders} // Pass loading state to ProductCard
          />
        );
      })}
    </div>
  );
};

export default ProductList;
