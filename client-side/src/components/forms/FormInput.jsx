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
  error,
  parentStyle = "",
  labelStyle = "",
  inputStyle = "",
  disabled = false,
  max,
  placeholder
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
    <div className={`relative w-full ${parentStyle}`}>
      <motion.label
        htmlFor={id}
        className={`absolute ${labelStyle} left-4 text-gray-500 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? "-translate-y-6 sm:text-sm text-xs text-blue-600 font-medium"
            : "top-1/2 transform -translate-y-1/2 text-base sm:text-lg"
        } ${error ? "text-red-600" : ""}`}
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
        className={`w-full px-4 py-3 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300 shadow-sm ${inputStyle} text-sm sm:text-base`}
        aria-invalid={!!error}
        aria-describedby={`${id}-error`}
        min={max}
        placeholder={placeholder}
        onWheel={type === "number" ? (e) => e.target.blur() : undefined}
      />

      {type === "password" && (
        <div
          className="absolute inset-y-0 right-4 flex items-center text-gray-600 cursor-pointer"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </div>
      )}

      {error && (
        <motion.p
          id={`${id}-error`}
          className="text-xs sm:text-sm text-red-500 mt-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FormInput;
