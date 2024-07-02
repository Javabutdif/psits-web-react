import React from 'react';
import { motion } from 'framer-motion';

const FormSelect = ({ label, name, value, onChange, options, styles }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={`form-group ${styles}`}
  >
    <label className="block text-gray-700">{label}</label>
    <motion.select
      name={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${styles}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <option value="">Select an option</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </motion.select>
  </motion.div>
);

export default FormSelect;
