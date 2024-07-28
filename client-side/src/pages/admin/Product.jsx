import React, { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../utils/alertHelper";
import { addMerchandise } from "../../api/admin";
import { getUser } from "../../authentication/Authentication";

function Product() {
  const [name] = getUser();
  const variation = [
    "White",
    "Purple",
    "Black",
    "Red",
    "Yellow",
    "Orange",
    "Blue",
    "Green",
    "Pink",
    "Gray",
    "Brown",
    "Cyan",
    "Magenta",
    "Teal",
    "Maroon",
  ];
  const size = ["18", "XS", "S", "M", "L", "XL", "2XL", "3XL"];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stocks: "",
    batch: "",
    description: "",
    start_date: "",
    end_date: "",
    category: "",
    created_by: name,
    control: "",
    selectedSizes: [],
    selectedVariations: [],
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("image", image);
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    console.log(data);
    try {
      await addMerchandise(data);
      showToast("success", "Merchandise added successfully");
    } catch (error) {
      showToast("error", error.message);
    }
  };

  const handleSizeClick = (size) => {
    setFormData((prevState) => {
      const isSelected = prevState.selectedSizes.includes(size);
      const newSelectedSizes = isSelected
        ? prevState.selectedSizes.filter((s) => s !== size)
        : [...prevState.selectedSizes, size];

      return {
        ...prevState,
        selectedSizes: newSelectedSizes,
      };
    });
  };

  const handleVariationClick = (variation) => {
    setFormData((prevState) => {
      const isSelected = prevState.selectedVariations.includes(variation);
      const newSelectedVariations = isSelected
        ? prevState.selectedVariations.filter((v) => v !== variation)
        : [...prevState.selectedVariations, variation];

      return {
        ...prevState,
        selectedVariations: newSelectedVariations,
      };
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              name="image_url"
              onChange={handleImageChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stocks
          </label>
          <input
            type="number"
            name="stocks"
            value={formData.stocks}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Batch
          </label>
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Uniform">Uniform</option>
            <option value="Intramurals">Intramurals</option>
            <option value="ICT Congress">ICT Congress</option>
            <option value="Merchandise">Merchandise</option>
          </select>

          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mt-4"
          >
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="" disabled>
              Select a type
            </option>
            {formData.category === "Uniform" && (
              <>
                <option value="CCS Uniform">CCS Uniform</option>
                <option value="Shorts">Shorts</option>
                <option value="Jacket">Jacket</option>
              </>
            )}
            {formData.category === "Intramurals" && (
              <>
                <option value="Tshirt">T-shirt</option>
                <option value="Ticket">Ticket</option>
                <option value="Water Bottle">Water Bottle</option>
              </>
            )}
            {formData.category === "ICT Congress" && (
              <>
                <option value="Ticket w/ Bundle">Ticket w/ Bundle</option>
              </>
            )}
            {formData.category === "Merchandise" && (
              <>
                <option value="Tshirt">Tshirt</option>
                <option value="Item">Item</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        ></textarea>
      </div>
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Purchase Control
        </label>
        <select
          name="control"
          value={formData.control}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="" disable>
            Select Control
          </option>
          <option value="Limited Purchase">Limited Purchase</option>
          <option value="Bulk Purchase">Bulk Purchase</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Variation
        </label>
        <div className="flex flex-wrap space-x-2 space-y-2">
          {variation.map((v, index) => (
            <span
              key={index}
              onClick={() => handleVariationClick(v)}
              className={`px-3 py-1 rounded-md cursor-pointer ${
                formData.selectedVariations.includes(v)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sizes</label>
        <div className="flex space-x-2">
          {size.map((size, index) => (
            <span
              key={index}
              onClick={() => handleSizeClick(size)}
              className={`px-3 py-1 rounded-md cursor-pointer ${
                formData.selectedSizes.includes(size)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {size}
            </span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded-md"
      >
        Submit
      </button>
    </form>
  );
}

export default Product;
