import React from 'react';
import { motion } from 'framer-motion';

const gridItems = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Example grid items

const GridAnimation = () => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {gridItems.map((item) => (
        <motion.div
          key={item}
          className="w-24 h-24 bg-blue-500 flex items-center justify-center text-white text-xl font-bold rounded-lg cursor-pointer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: item * 0.1 }}
          whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }} // Scale up and change color on hover
          whileTap={{ scale: 0.9 }} // Scale down on click
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
};

export default GridAnimation;
a