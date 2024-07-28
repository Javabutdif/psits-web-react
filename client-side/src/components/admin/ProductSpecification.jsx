import React from "react";

function ProductSpecifications() {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Product Specifications</h2>
      <div className="grid grid-cols-1 gap-4">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Category"
        />
        <input className="border p-2 rounded" type="text" placeholder="Brand" />
        <input className="border p-2 rounded" type="text" placeholder="Model" />
        <input className="border p-2 rounded" type="text" placeholder="Color" />
        <input className="border p-2 rounded" type="text" placeholder="Size" />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Other Specifications"
        />
      </div>
    </div>
  );
}

export default ProductSpecifications;
