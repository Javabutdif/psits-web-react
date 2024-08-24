import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  onClose
}) => {
  const controlOptions = ['limited', 'bulk'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const colorOptions = [
    'red', 'blue', 'green', 'yellow', 'black', 'white',
    'purple', 'orange', 'pink', 'gray'
  ];
  const categoryOptions = [
    { value: 'uniform', label: 'Uniform' },
    { value: 'intramurals', label: 'Intramurals' },
    { value: 'ict-congress', label: 'ICT Congress' },
    { value: 'merchandise', label: 'Merchandise' }
  ];

  const modalRef = useRef();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const FilterSection = ({ title, options, selectedOptions, onChange, isColor = false }) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const label = typeof option === 'object' ? option.label : option;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                selectedOptions.includes(value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isColor ? 'w-6 h-6 p-0' : ''}`}
              style={isColor ? { backgroundColor: value } : {}}
            >
              {isColor ? '' : label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const DateSection = ({ title, date, onDateChange }) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-3 py-2 border rounded-md w-full text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );

  const PriceSection = ({ minPrice, maxPrice, onPriceChange }) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">Price Range</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minPrice}
          onChange={(e) => onPriceChange(e.target.value, 'min')}
          placeholder="Min"
          className="px-3 py-2 border rounded-md w-full text-sm focus:outline-none focus:border-primary"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => onPriceChange(e.target.value, 'max')}
          placeholder="Max"
          className="px-3 py-2 border rounded-md w-full text-sm focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white w-full max-w-md h-full overflow-y-auto p-6 shadow-lg"
        ref={modalRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Filter Options</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
      </motion.div>
    </motion.div>
  );
};

export default FilterOptions;
