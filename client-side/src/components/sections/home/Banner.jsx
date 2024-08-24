import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';

const headingVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10, duration: 0.8 } },
};

const paragraphVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10, duration: 0.8, delay: 0.2 } },
};

const containerVariant = {
  visible: {
    transition: {
      staggerChildren: 0.4,
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const Banner = () => {
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();
  
  // Transform scrollYProgress into contentY position
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-500%']);

  // Scroll-based animation trigger with a slight delay
  useEffect(() => {
    const handleScroll = () => {
      setTimeout(() => {
        controls.start('visible');
      }, 400); // Adjust delay here (in milliseconds)
    };

    handleScroll(); // Call on mount

    return scrollYProgress.onChange(handleScroll);
  }, [controls, scrollYProgress]);

  return (
    <motion.section
      className="relative -z-10 bg-gradient-to-b from-primary to-secondary py-24 md:py-28 flex items-center justify-center"
    >
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-5xl text-start md:text-center px-4 space-y-6 md:space-y-8 md:-mb-5"
        variants={containerVariant}
        initial="hidden"
        animate={controls}
      >
        <motion.h1
          variants={headingVariant}
          className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-extrabold text-white"
        >
          Empowering the Next Generation of IT Professionals
        </motion.h1>
        <motion.p
          variants={paragraphVariant}
          className="text-sm md:text-lg lg:text-xl xl:text-2xl text-white"
        >
          Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
        </motion.p>
      </motion.div>
      <svg className="absolute -bottom-0 translate-y-fulls" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 18">
        <path d="M375.303 0c0 0-93.054 17.7075-187.13 17.7075C94.0966 17.7075 0 0 0 0Z" fill="#A4CDD7"></path>
      </svg>
    </motion.section>
  );
};

export default Banner;
