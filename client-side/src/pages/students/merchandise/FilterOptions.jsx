import React from "react";

// Reusable Button Component
const FilterButton = ({ value, label, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1 px-3 rounded-md border text-xs ${
        isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
      } transition duration-150`}
    >
      {label}
    </button>
  );
};

// Reusable Color Swatch Component
const ColorSwatch = ({ color, isSelected, onClick }) => {
  const colorClasses = {
    White: "bg-white border-gray-300",
    Purple: "bg-purple-500",
    Black: "bg-black",
    Red: "bg-red-500",
    Yellow: "bg-yellow-500",
    Orange: "bg-orange-500",
    Blue: "bg-blue-500",
    Green: "bg-green-500",
    Pink: "bg-pink-500",
    Gray: "bg-gray-500",
    Brown: "bg-brown-500",
    Cyan: "bg-cyan-500",
    Magenta: "bg-magenta-500",
    Teal: "bg-teal-500",
    Maroon: "bg-maroon-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-6 h-6 rounded-full border ${colorClasses[color]} ${
        isSelected ? "ring-2 ring-blue-400" : ""
      } transition duration-150`}
      aria-label={color} // Accessibility
    >
      {/* No text, just the color */}
    </button>
  );
};

// Main FilterOptions Component
const FilterOptions = ({
  onCategoryChange,
  selectedCategories,
  onControlChange,
  selectedControls,
  onSizeChange,
  selectedSizes,
  onVariationChange,
  selectedVariations,
  onClick, // Added prop for reset function
}) => {
  const categoryOptions = [
    { value: "uniform", label: "Uniform" },
    { value: "intramurals", label: "Intramurals" },
    { value: "ict-congress", label: "ICT Congress" },
    { value: "merchandise", label: "Merchandise" },
  ];

  const controls = [
    { value: "limited", label: "Limited" },
    { value: "bulk", label: "Bulk" },
  ];

  const variations = [
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

  const sizes = ["18", "XS", "S", "M", "L", "XL", "2XL", "3XL"];

  const handleFilterChange = (value, type) => {
    switch (type) {
      case "category":
        onCategoryChange(value, !selectedCategories.includes(value));
        break;
      case "control":
        onControlChange(value, !selectedControls.includes(value));
        break;
      case "size":
        onSizeChange(value, !selectedSizes.includes(value));
        break;
      case "variation":
        onVariationChange(value, !selectedVariations.includes(value));
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow-md p-4 absolute right-4 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-auto">
      <form className="space-y-4 relative">
        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <FilterButton
                key={option.value}
                value={option.value}
                label={option.label}
                isSelected={selectedCategories.includes(option.value)}
                onClick={() => handleFilterChange(option.value, "category")}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">
            Controls
          </h3>
          <div className="flex flex-wrap gap-2">
            {controls.map((control) => (
              <FilterButton
                key={control.value}
                value={control.value}
                label={control.label}
                isSelected={selectedControls.includes(control.value)}
                onClick={() => handleFilterChange(control.value, "control")}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <FilterButton
                key={size}
                value={size}
                label={size}
                isSelected={selectedSizes.includes(size)}
                onClick={() => handleFilterChange(size, "size")}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">
            Variations
          </h3>
          <div className="flex flex-wrap gap-2">
            {variations.map((variation) => (
              <ColorSwatch
                key={variation}
                color={variation}
                isSelected={selectedVariations.includes(variation)}
                onClick={() => handleFilterChange(variation, "variation")}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterOptions;
