import React from 'react';

const FilterOptions = ({ 
  onCategoryChange, selectedCategories, 
  onControlChange, selectedControls, 
  onSizeChange, selectedSizes, 
  onVariationChange, selectedVariations 
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

  const handleCheckboxChange = (e) => {
    const { value, name, checked } = e.target;
    if (name === 'category') {
      onCategoryChange(value, checked);
    } else if (name === 'control') {
      onControlChange(value, checked);
    } else if (name === 'size') {
      onSizeChange(value, checked);
    } else if (name === 'variation') {
      onVariationChange(value, checked);
    }
  };

  const handleButtonClick = (value, name) => {
    if (name === 'size') {
      onSizeChange(value, !selectedSizes.includes(value));
    } else if (name === 'variation') {
      onVariationChange(value, !selectedVariations.includes(value));
    }
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow-md p-4 absolute right-4 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-auto">
      <form className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">Categories</h3>
          {categoryOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={option.value} 
                name="category"
                value={option.value} 
                checked={selectedCategories.includes(option.value)}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={option.value} className="text-gray-700 text-sm">{option.label}</label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">Controls</h3>
          {controls.map(control => (
            <div key={control.value} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={control.value} 
                name="control"
                value={control.value} 
                checked={selectedControls.includes(control.value)}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={control.value} className="text-gray-700 text-sm">{control.label}</label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleButtonClick(size, 'size')}
                className={`py-1 px-3 rounded-md border ${selectedSizes.includes(size) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition duration-150`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-2">Variations</h3>
          <div className="flex flex-wrap gap-2">
            {variations.map(variation => (
              <button
                key={variation}
                type="button"
                onClick={() => handleButtonClick(variation, 'variation')}
                className={`py-1 px-3 rounded-md border ${selectedVariations.includes(variation) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition duration-150`}
              >
                {variation}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterOptions;
