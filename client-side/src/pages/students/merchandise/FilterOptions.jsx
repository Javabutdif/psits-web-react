import React from 'react';

const FilterOptions = ({ 
  onCategoryChange, selectedCategories, 
  onControlChange, selectedControls, 
  onSizeChange, selectedSizes, 
  onVariationChange, selectedVariations,
  onClick // Added prop for reset function
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
    "White", "Purple", "Black", "Red", "Yellow",
    "Orange", "Blue", "Green", "Pink", "Gray",
    "Brown", "Cyan", "Magenta", "Teal", "Maroon",
  ];

  const sizes = ["18", "XS", "S", "M", "L", "XL", "2XL", "3XL"];

  const handleButtonClick = (value, type) => {
    if (type === 'category') {
      onCategoryChange(value, !selectedCategories.includes(value));
    } else if (type === 'control') {
      onControlChange(value, !selectedControls.includes(value));
    } else if (type === 'size') {
      onSizeChange(value, !selectedSizes.includes(value));
    } else if (type === 'variation') {
      onVariationChange(value, !selectedVariations.includes(value));
    }
  };

  const handleResetClick = () => {
    // Reset all filters
    onCategoryChange(null, false);
    onControlChange(null, false);
    onSizeChange(null, false);
    onVariationChange(null, false);
  };

  const colorClasses = {
    White: 'bg-white border-gray-300',
    Purple: 'bg-purple-500',
    Black: 'bg-black',
    Red: 'bg-red-500',
    Yellow: 'bg-yellow-500',
    Orange: 'bg-orange-500',
    Blue: 'bg-blue-500',
    Green: 'bg-green-500',
    Pink: 'bg-pink-500',
    Gray: 'bg-gray-500',
    Brown: 'bg-brown-500',
    Cyan: 'bg-cyan-500',
    Magenta: 'bg-magenta-500',
    Teal: 'bg-teal-500',
    Maroon: 'bg-maroon-500',
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow-md p-4 absolute right-4 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-auto">
      <form className="space-y-4 relative ">
        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleButtonClick(option.value, 'category')}
                className={`py-1 px-3 rounded-md border text-xs ${selectedCategories.includes(option.value) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition duration-150`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">Controls</h3>
          <div className="flex flex-wrap gap-2">
            {controls.map(control => (
              <button
                key={control.value}
                type="button"
                onClick={() => handleButtonClick(control.value, 'control')}
                className={`py-1 px-3 rounded-md border text-xs ${selectedControls.includes(control.value) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition duration-150`}
              >
                {control.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleButtonClick(size, 'size')}
                className={`py-1 px-3 rounded-md border text-xs ${selectedSizes.includes(size) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition duration-150`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2 border-b pb-2">Variations</h3>
          <div className="flex flex-wrap gap-2">
            {variations.map(variation => (
              <button
                key={variation}
                type="button"
                onClick={() => handleButtonClick(variation, 'variation')}
                className={`w-6 h-6 rounded-full border ${colorClasses[variation]} ${selectedVariations.includes(variation) ? 'ring-2 ring-blue-400' : ''} transition duration-150`}
                aria-label={variation} // Accessibility
              >
                {/* No text, just the color */}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute -top-6 right-0 text-center mt-4">
          <button
            type="button"
            onClick={onClick}
            className="py-2 px-4 text-xs rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition duration-150"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterOptions;
