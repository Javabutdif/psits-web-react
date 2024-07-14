import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FormInput = ({ label, type, id, name, value, onChange, styles, error }) => {
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
      className="relative flex-1"
    >
      <div className="absolute text-xs text-red-600 -top-5 right-0">
        {error}
      </div>

      <motion.label
        htmlFor={id}

        className={`text-xs md:text-sm lg: lg:text-md absolute left-2 top-1/3 translate-y-2/4 transition-transform duration-300 ${
          isFocused || value ? 'text-xs -top-[0.01rem] bg-white' : 'text-base'

        }`}
        animate={{
          scale: isFocused || value ? 0.9 : 1,
          y: isFocused || value ? -23 : 0,
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

        className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles}`}

      />
    </motion.div>
  );
};

export default FormInput;
