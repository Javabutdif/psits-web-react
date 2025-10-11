import React, { useState, useEffect } from "react";
import { activePublishMerchandise } from "../../../api/admin";

const PromoAddCode = ({ onCancel }) => {
  const [type, setType] = useState("");
  const [limitType, setLimitType] = useState("Limited");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [selectedMerchandise, setSelectedMerchandise] = useState([]);
  const [activeMerchandise, setActiveMerchandise] = useState([]);

  const fetchData = async () => {
    try {
      const data = await activePublishMerchandise();
      setActiveMerchandise(data ? data : []);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const merchandiseList = [
    "T-Shirt",
    "Hoodie",
    "Sticker Pack",
    "Lanyard",
    "Tumbler",
  ];

  const handleStudentChange = (e) => {
    const values = e.target.value.split(",").map((v) => v.trim());
    setSelectedStudents(values);
  };

  const handleOrgChange = (org) => {
    setSelectedOrganizations((prev) =>
      prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org]
    );
  };

  const handleMerchChange = (item) => {
    setSelectedMerchandise((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Add Promo Code
        </h2>

        {/* Promo Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Promo Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            placeholder="Enter promo name"
          />
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="Specific">Specific</option>
            <option value="Organization">Organization</option>
            <option value="All Students">All Students</option>
          </select>
        </div>

        {/* Conditional Fields */}
        {type === "Specific" && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Student IDs (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. 2021001, 2021023"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
              onChange={handleStudentChange}
            />
          </div>
        )}

        {type === "Organization" && (
          <div>
            <p className="block text-sm font-medium text-gray-600 mb-1">
              Sub Organizations
            </p>
            <div className="flex flex-wrap gap-3">
              {["Officers", "Media", "Developers", "Volunteers"].map((org) => (
                <label key={org} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOrganizations.includes(org)}
                    onChange={() => handleOrgChange(org)}
                    className="accent-blue-600"
                  />
                  <span className="text-gray-700 text-sm">{org}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Quantity
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            placeholder="Enter quantity"
          />
        </div>

        {/* Limited / Unlimited */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Limit Type
          </label>
          <div className="flex gap-4">
            {["Limited", "Unlimited"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="limitType"
                  value={option}
                  checked={limitType === option}
                  onChange={() => setLimitType(option)}
                  className="accent-blue-600"
                />
                <span className="text-gray-700 text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Merchandise */}
        <div>
          <p className="block text-sm font-medium text-gray-600 mb-1">
            Applied Merchandise
          </p>
          <div className="grid grid-cols-2 gap-2">
            {activeMerchandise.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedMerchandise.includes(item)}
                  onChange={() => handleMerchChange(item)}
                  className="accent-blue-600"
                />
                <span className="text-gray-700 text-sm">{item.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            placeholder="Enter discount percentage"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Save Promo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoAddCode;
