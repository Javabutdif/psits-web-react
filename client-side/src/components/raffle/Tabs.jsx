import React, { useState } from 'react'
import { motion } from 'framer-motion'

const campusList = [
  'Main',
  'Banilad',
  'LLM',
  'Pardo',
  'All'
];

const Tabs = ({ onSelectCampus }) => {
  const [activeCampus, setActiveCampus] = useState('Main');

  const handleSelectCampus = (campus) => {
    setActiveCampus(campus);
    onSelectCampus(campus);
  };

  return (
    <div className='flex gap-2 rounded-lg bg-primary text-white p-2 shadow-lg'>
      {campusList.map(campus => (
        <motion.button 
          key={campus} 
          className={`px-4 py-2 rounded-full transition-transform duration-300 ease-in-out transform ${activeCampus === campus ? 'bg-navy scale-110 shadow-xl' : 'hover:scale-105'}`}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelectCampus(campus)}
        >
          {campus}
        </motion.button>
      ))}
    </div>
  );
};

export default Tabs
    