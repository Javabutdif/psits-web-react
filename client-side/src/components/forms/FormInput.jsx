import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const FormInput = ({
  label,
  type,
  id,
  name,
  value,
  onChange,
  styles,
  error,
  parentStyle,
  labelStyle,
  inputStyle,
  disabled,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    if (!value) setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <motion.div className={`relative flex-1 ${parentStyle}`}>
      {error && (
        <p className="absolute text-xs text-red-600 -bottom-5 left-0">
          {error}
        </p>
      )}

      <motion.label
        htmlFor={id}
        className={`absolute ${labelStyle} top-2 left-2 text-gray-700 transition-transform duration-300 ease-in-out ${
          isFocused || value
            ? "text-black bg-white scale-75 -translate-y-4"
            : ""
        } ${error ? "text-red-600" : ""}`}
        animate={{
          scale: isFocused || value ? 0.75 : 1,
          y: isFocused || value ? -20 : 0,
          opacity: isFocused || value ? 0.6 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.label>

      <input
        type={showPassword && type === "password" ? "text" : type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`${inputStyle} w-full px-3 py-2 border ${
          error ? "border-red-600" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${styles}`}
        aria-invalid={!!error}
        aria-describedby={`${id}-error`}
        autoComplete="off"
        min={max}
      />

      {type === "password" && (
        <div
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
      )}
    </motion.div>
  );
};

export default FormInput;
