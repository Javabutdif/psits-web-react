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
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '1000%']); // Adjusted the range for better visual effect

  useEffect(() => {
    const handleScroll = () => {
      controls.start('visible');
    };

    handleScroll(); // Call on mount

    return scrollYProgress.onChange(handleScroll);
  }, [controls, scrollYProgress]);

  return (
    <motion.section
      className="relative bg-gradient-to-b from-primary py-24 md:py-32 via-50% to-[#f2f2f2] overflow-hidden  flex items-center justify-center"
    >
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-5xl  text-start md:text-center px-4 space-y-6 md:space-y-8"
        variants={containerVariant}
        initial="hidden"
        animate={controls}
      >
        <motion.h1
          variants={headingVariant}
          className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-extrabold text-white"
        >
          Building the Future of IT with Our Premier Events
        </motion.h1>
        <motion.p
          variants={paragraphVariant}
          className="text-sm md:text-lg lg:text-xl xl:text-2xl text-white"
        >
          Join us for workshops, conferences, and networking opportunities designed to boost your IT career.
        </motion.p>
      </motion.div>
    </motion.section>
  );
};

export default Banner;
