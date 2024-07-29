import React, { useState } from "react";
import { motion } from "framer-motion";

const FormTextArea = ({ label, id, name, value, onChange, styles, error, parentStyle, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    if (!value) setIsFocused(false);
  };

  return (
    <motion.div className={`relative flex-1 ${parentStyle}`}>
      {/* Error message */}
      {error && (
        <p className="absolute text-xs text-red-600 -bottom-5 left-0">
          {error}
        </p>
      )}

      {/* Label */}
      <motion.label
        htmlFor={id}
        className={`absolute left-3 top-3 text-gray-700 transition-transform duration-300 ease-in-out ${isFocused || value ? 'text-black bg-white scale-75 -translate-y-4' : 'text-base'}`}
        animate={{
          scale: isFocused || value ? 0.75 : 1,
          y: isFocused || value ? -20 : 0,
          opacity: isFocused || value ? 0.6 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.label>

      {/* Textarea */}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full px-3 py-2 border ${error ? 'border-red-600' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${styles}`}
        rows="4" // Adjust rows as needed
        autoComplete="off"
      />
    </motion.div>
  );
};

export default FormTextArea;
