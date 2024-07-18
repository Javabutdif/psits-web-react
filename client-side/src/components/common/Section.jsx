import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Section = forwardRef(({ children, inView, transitionVariants, parentStyle, childrenStyle }, ref) => {
  return (
    <motion.section
      ref={ref}
      className={parentStyle}
    >
      <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          exit="hidden"
          variants={transitionVariants}
          className={childrenStyle}
      >
        {children}
      </motion.div>
    </motion.section>
  );
});

// Set the display name for the component
Section.displayName = 'Section';

export default Section;
