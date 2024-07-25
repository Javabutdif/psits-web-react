import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FormTextArea = ({ label, id, name, value, onChange, styles, error, parentStyle, disabled }) => {
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
      className={`${parentStyle} relative flex-1`}
    >
      <div className="absolute text-xs text-red-600 -top-5 right-0">
        {error}
      </div>

      <motion.label
        htmlFor={id}
        className={`text-xs md:text-sm lg:text-md absolute left-2 top-1 transition-transform duration-300 ${
          isFocused || value ? 'text-xs -top-[0.01rem] bg-white' : 'text-base'
        }`}
        animate={{
          scale: isFocused || value ? 0.9 : 1,
          y: isFocused || value ? -14 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles}`}
        rows="4" // You can adjust the number of rows as needed
      />
    </motion.div>
  );
};

export default FormTextArea;
