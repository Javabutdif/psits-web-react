import React from "react";

function PurchaseSettings() {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Purchase Settings</h2>
      <div className="grid grid-cols-1 gap-4">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Lead Time"
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Supplier"
        />
      </div>
      <button className="mt-4 p-2 bg-blue-500 text-white rounded">
        Generate QR Code
      </button>
      <div className="border p-4 rounded text-center mt-4">
        <p>QR Code Section</p>
      </div>
    </div>
  );
}

export default PurchaseSettings;
