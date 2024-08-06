import React, { Suspense, lazy } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Lazy load OrderCard
const OrderCard = lazy(() => import('./OrderCard'));

const OrderList = ({ orders, onCancel, onCheckboxChange, selectedOrders }) => {
  return (
    <LazyMotion features={domAnimation}>
      <div className="order-list">
        <Suspense fallback={<div>Loading...</div>}>
          {orders.map((order, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <OrderCard
                order={order}
                onCancel={onCancel}
                onCheckboxChange={onCheckboxChange}
                selectedOrders={selectedOrders}
              />
            </m.div>
          ))}
        </Suspense>
      </div>
    </LazyMotion>
  );
};

export default OrderList;
