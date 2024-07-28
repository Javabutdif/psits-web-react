import React from "react";

function ProductInventory() {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Product Inventory</h2>
      <div className="grid grid-cols-1 gap-4">
        <input className="border p-2 rounded" type="text" placeholder="Size" />
        <input className="border p-2 rounded" type="text" placeholder="Color" />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Stock Quantity"
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Reorder Level"
        />
      </div>
    </div>
  );
}

export default ProductInventory;
