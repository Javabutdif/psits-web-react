import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FormInput = ({ label, type, id, name, value, onChange, styles }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.label
        htmlFor={id}
        className={`text-xs top-3 md:text-sm lg: lg:text-md absolute left-2 md:top-2 transition-transform duration-300 ${
          isFocused || value ? 'text-xs -top-3 bg-white' : 'text-base'
        }`}
        animate={{
          scale: isFocused || value ? 0.9 : 1,
          y: isFocused || value ? -16 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles}`}
      />
    </motion.div>
  );
};

export default FormInput;
