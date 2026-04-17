import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const FilterOptions = ({
  onCategoryChange,
  selectedCategories,
  onControlChange,
  selectedControls,
  onSizeChange,
  selectedSizes,
  onColorChange,
  selectedColors,
  onStartDateChange,
  startDate,
  onEndDateChange,
  endDate,
  onPriceChange,
  minPrice,
  maxPrice,
  onClose,
  onReset, // Add onReset prop
}) => {
  const controlOptions = ["limited-purchase", "bulk-purchase"];
  const sizeOptions = [
    "2XS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
    "18",
  ];
  const colorOptions = [
    "red",
    "blue",
    "green",
    "yellow",
    "black",
    "white",
    "purple",
    "orange",
    "pink",
    "gray",
  ];
  const categoryOptions = [
    { value: "uniform", label: "Uniform" },
    { value: "intramurals", label: "Intramurals" },
    { value: "ict-congress", label: "ICT Congress" },
    { value: "merchandise", label: "Merchandise" },
  ];

  const modalRef = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const FilterSection = ({
    title,
    options,
    selectedOptions,
    onChange,
    isColor = false,
  }) => (
    <div className="mb-4">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                selectedOptions.includes(value)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${isColor ? "h-6 w-6 p-0" : ""}`}
              style={isColor ? { backgroundColor: value } : {}}
            >
              {isColor ? "" : label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const DateSection = ({ title, date, onDateChange }) => (
    <div className="mb-4">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );

  const PriceSection = ({ minPrice, maxPrice, onPriceChange }) => (
    <div className="mb-4">
      <h3 className="mb-2 text-base font-semibold">Price Range</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minPrice}
          onChange={(e) => onPriceChange(e.target.value, "min")}
          placeholder="Min"
          className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => onPriceChange(e.target.value, "max")}
          placeholder="Max"
          className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );

  const handleReset = () => {
    onCategoryChange([]); // Clear selected categories
    onControlChange([]); // Clear selected controls
    onSizeChange([]); // Clear selected sizes
    onColorChange([]); // Clear selected colors
    onStartDateChange(""); // Reset start date
    onEndDateChange(""); // Reset end date
    onPriceChange("", "min"); // Reset min price
    onPriceChange("", "max"); // Reset max price
    onReset(); // Optional: call any additional reset function
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-lg"
        ref={modalRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Filter Options</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <FilterSection
          title="Categories"
          options={categoryOptions}
          selectedOptions={selectedCategories}
          onChange={onCategoryChange}
        />

        <FilterSection
          title="Controls"
          options={controlOptions}
          selectedOptions={selectedControls}
          onChange={onControlChange}
        />

        <FilterSection
          title="Sizes"
          options={sizeOptions}
          selectedOptions={selectedSizes}
          onChange={onSizeChange}
        />

        <FilterSection
          title="Colors"
          options={colorOptions}
          selectedOptions={selectedColors}
          onChange={onColorChange}
          isColor
        />

        <DateSection
          title="Start Date"
          date={startDate}
          onDateChange={onStartDateChange}
        />

        <DateSection
          title="End Date"
          date={endDate}
          onDateChange={onEndDateChange}
        />

        <PriceSection
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={onPriceChange}
        />

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleReset}
            className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterOptions;
