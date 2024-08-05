import React from 'react';
import { motion } from 'framer-motion';

const bounceVariants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -10, 0], // Bounce effect
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    }
  }
};

const Banner = () => {
  return (
    <section className="min-h-screen bg-primary  text-white py-20 flex flex-col justify-center text-center items-center">
      <div className="container flex flex-col justify-center text-center items-center">
        <div className=" px-4 md:px-0 space-y-4  relative">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold max-w-3xl"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Empowering the Next Generation of IT Professionals
          </motion.h1>
          <motion.p 
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
          </motion.p>
          <motion.button 
            className="absolute -bottom-24 md:-bottom-32 left-0 w-full justify-center flex flex-col items-center"
            variants={bounceVariants}
            initial="initial"
            animate="animate"
          >   
            <span>Explore</span>
            <svg 
              className="transform md:w-10 md:h-10 w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
