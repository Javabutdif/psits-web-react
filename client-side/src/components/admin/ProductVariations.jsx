import React from "react";

function ProductVariations() {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Product Variations</h2>
      <div className="grid grid-cols-3 gap-4">
        <button className="p-2 bg-blue-500 text-white rounded">S</button>
        <button className="p-2 bg-blue-500 text-white rounded">M</button>
        <button className="p-2 bg-blue-500 text-white rounded">L</button>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <select className="border p-2 rounded">
          <option>Color 1</option>
          <option>Color 2</option>
          <option>Color 3</option>
        </select>
      </div>
    </div>
  );
}

export default ProductVariations;
