import React from 'react';
import OrderCard from './OrderCard';

const OrderList = ({ orders, onCancel, onCheckboxChange, selectedOrders }) => {
  return (
    <div className="">
      {orders.map((order, index) => (
        <OrderCard
          order={order}
          onCancel={onCancel}
          onCheckboxChange={onCheckboxChange}
          selectedOrders={selectedOrders}
          key={index}
        />
      ))}
    </div>
  );
};

export default OrderList;
