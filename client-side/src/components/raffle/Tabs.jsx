import { motion } from 'framer-motion';
import React, { useState } from 'react';

const campusList = [
  'UC-Main',
  'UC-Banilad',
  'UC-LM',
  'UC-Pardo',
  'All'
];

const Tabs = ({ onSelectCampus }) => {
  const [activeCampus, setActiveCampus] = useState('UC-Main');

  const handleSelectCampus = (campus) => {
    setActiveCampus(campus);
    onSelectCampus(campus);
  };

  return (
    <div className='mb-5 flex gap-2 justify-center items-center rounded-lg bg-primary text-white p-2 shadow-lg'>
      {campusList.map(campus => {
        // Remove 'UC-' from the campus name for display
        const displayCampus = campus.replace('UC-', '');

        return (
          <motion.button 
            key={campus} 
            className={`px-4 py-2 rounded-full transition-transform duration-300 ease-in-out transform ${activeCampus === campus ? 'bg-navy scale-110 shadow-xl' : 'hover:scale-105'}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectCampus(campus)}
          >
            {displayCampus} {/* Display the transformed campus name */}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Tabs
    