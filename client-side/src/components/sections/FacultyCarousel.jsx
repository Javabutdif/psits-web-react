import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const carouselVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0 },
};

const FacultyCarousel = ({ faculty }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();

  const handleScroll = (direction) => {
    setCurrentIndex((prevIndex) => {
      const newIndex = direction === 'next'
        ? (prevIndex + 1) % faculty.length
        : (prevIndex - 1 + faculty.length) % faculty.length;
      controls.start({ x: direction === 'next' ? '-100%' : '100%' });
      return newIndex;
    });
  };

  return (
    <div className="relative black overflow-hidden h-96">
      <motion.div
        className="flex space-x-4 bg-b"
        animate={controls}
        initial="hidden"
        variants={carouselVariants}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {faculty.map((member, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-48 h-48 bg-gray-100 border text-black border-gray-300 rounded-lg p-4 ${index === currentIndex ? 'block' : 'hidden'}`}
          >
            <img
              src={member.thumbnail} 
              alt={member.name}
              className="w-full h-full object-cover rounded-lg"
            />
            <h3 className="text-xl font-semibold mt-2">{member.name}</h3>
            <p className="text-gray-600">{member.position}</p>
          </div>
        ))}
      </motion.div>
      <button
        onClick={() => handleScroll('prev')}
        className="absolute top-1/2 left-2 bg-gray-800 text-white p-2 rounded transform -translate-y-1/2"
      >
        Prev
      </button>
      <button
        onClick={() => handleScroll('next')}
        className="absolute top-1/2 right-2 bg-gray-800 text-white p-2 rounded transform -translate-y-1/2"
      >
        Next
      </button>
    </div>
  );
};

export default FacultyCarousel;
