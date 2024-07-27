  import React from 'react';
  import { motion } from 'framer-motion'


  const FormButton = ({ type, text, onClick, styles, variants, initial, animate, whileHover, whileTap, icon} ) => {
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
      >
        {icon}

        {text}
      </motion.button>
    );
  };

  export default FormButton;
