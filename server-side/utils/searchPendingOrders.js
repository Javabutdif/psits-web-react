// utils/searchPendingOrders.js

const applySearch = (orders, searchQuery) => {
    if (!searchQuery) return orders;
  
    const filtered = orders.filter(order =>
      order.items.some(item =>
        item.product_name &&
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  
    return filtered;
  };
  
  module.exports = applySearch;