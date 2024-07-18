import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Banner = () => {
  const text = "Empowering the Next Generation of IT Professionals";
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = (index) => {
    const randomX = Math.random() * 200 - 100; // Random x position
    const randomY = Math.random() * 50 - 25;   // Random y position

    return {
      hidden: {
        opacity: 0,
        x: randomX,
        y: randomY,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 50,
          damping: 20,
        },
      },
    };
  };

  return (
    <div className="text-white max-w-3xl p-4  sm:p-6">
      <motion.h1
        className="text-3xl mb-6 sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center md:text-start"
        variants={container}
        initial="hidden"
        exit={{ scale: '0'}}
        animate="visible"
      >
        {words.map((word, index) => (
          <motion.span key={index} className="inline-block mr-2" variants={item(index)}>
            {word}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p 
        initial={{opacity:0, y:-20 }}
        animate={{opacity:1, y: 0}}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-md w-full mb-8 md:max-w-lg text-center">
        Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
      </motion.p>
      <motion.button
        initial={{ scale: 2 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: '-3deg' }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-sm sm:text-md bg-blue-500 hover:bg-blue-400 font-bold py-2 px-4 rounded mx-auto md:mx-0 block"
      >
        <Link to="/register" className="no-underline text-white">
          Get Membership
        </Link>
      </motion.button>
    </div>
  );
};

export default Banner;
