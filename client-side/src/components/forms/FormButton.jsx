import React from "react";
import { motion } from "framer-motion";

const FormButton = ({
  type,
  text,
  onClick,
  styles,
  variants,
  initial,
  animate,
  whileHover,
  whileTap,
  icon,
  textClass, // Add this prop
  disabled,
  title
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={styles}
      variants={variants}
      initial={initial}
      animate={animate}
      whileHover={whileHover}
      whileTap={whileTap}
      disabled={disabled}
      title={title}
    >
      {icon}
      <span className={textClass}>{text}</span> {/* Apply textClass here */}
    </motion.button>
  );
};

export default FormButton;
