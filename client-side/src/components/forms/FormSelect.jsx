import React from 'react';
import { motion } from 'framer-motion';

const FormSelect = ({ label, name, value, onChange, options, styles, labelStyle, optionStyle, disabled, error }) => (
  <motion.div className={`relative form-group ${styles}`}>
    {error && <p className="absolute text-xs text-red-600 top-1 right-0">{error}</p>}
    <label className={`${error ? "text-red-600" : "text-gray-700"} ${labelStyle} block`}>{label}</label>
    <motion.select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full p-2 border  ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500  ${optionStyle} ${styles}`}
    //  whileHover={{ scale: 1.05 }}
      // whileTap={{ scale: 0.95 }}
    >
      <option value="" disabled>Select an option</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </motion.select>
  </motion.div>
);

export default FormSelect;
