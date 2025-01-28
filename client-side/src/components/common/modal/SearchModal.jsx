import React, { useState } from "react";
import { fetchStudentName, requestRoleAdmin } from "../../../api/admin";

function SearchModal({ position, onClose }) {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const response = await fetchStudentName(number);

    setTimeout(() => {
      if (response) {
        setResult(
          `Result: ${response.data.first_name + " " + response.data.last_name}`
        );
        setLoading(false);
      } else {
        setResult("No student found with that ID number");
        setLoading(false);
      }
    }, 1000);
  };

  const handleRequest = async () => {
    const lowerCase = position.toLowerCase();

    if (await requestRoleAdmin(lowerCase, number)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 relative">
        <div className="flex justify-between items-center mb-4">
          <h1>Add {position} Role</h1>
          <button
            onClick={onClose}
            className="text-3xl text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <h2 className="text-lg font-medium mb-4">Enter ID Number</h2>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter a number"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`mt-4 w-full p-2 rounded-lg text-white ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {result && (
          <div>
            <div className="mt-4 text-sm text-gray-700 bg-gray-100 p-2 rounded-lg">
              {result}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleRequest()}
                className="w-1/2 p-2 mr-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                Request
              </button>
              <button
                onClick={onClose}
                className="w-1/2 p-2 ml-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
