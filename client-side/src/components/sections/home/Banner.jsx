import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import banner from '../../../assets/images/banner.png';
import desktop from '../../../assets/images/3d-computer.png';
import processor from '../../../assets/images/cpu.png';

const Banner = () => {
  const { scrollY } = useScroll();

  // Vertical transformations
  const y = useTransform(scrollY, [0, 500], ['0%', '10%']);
  const textScale = useTransform(scrollY, [0, 600], [1, 2]);

  // Transformations for images
  const xDesktop = useTransform(scrollY, [0, 500], ['30vw', '20vw']);
  const yDesktop = useTransform(scrollY, [0, 500], ['20vh', '10vh']);

  const xProcessor = useTransform(scrollY, [0, 500], ['-30vw', '-20vw']);
  const yProcessor = useTransform(scrollY, [0, 500], ['-20vh', '-10vh']);

  // Opacity for fade effect
  const popOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Scaling and translating upwards effect
  const scaleAndY = useTransform(scrollY, [0, 300], [1, 1.5]);

  return (
    <motion.section
      className="min-h-screen bg-prim text-black py-20 flex flex-col justify-center items-center sticky top-0 overflow-hidden"
      style={{ y }}
    >
      <div className="absolute h-full w-full opacity-10">
        <img src={banner} alt="Banner" className="w-full object-cover h-full" />
      </div>
      <div className="container flex flex-col justify-center items-center relative">
        {[
          { src: desktop, x: xDesktop, y: yDesktop, alt: "Desktop" },
          { src: processor, x: xProcessor, y: yProcessor, alt: "Processor" },
        ].map((item, index) => (
          <motion.img
            key={index}
            src={item.src}
            alt={item.alt}
            className="absolute"
            style={{
              width: '20vw',
              height: '20vw',
              maxWidth: '6rem',
              maxHeight: '6rem',
              x: item.x,
              y: item.y,
              opacity: popOpacity,
              transition: 'transform 0.8s ease-out, opacity 0.8s ease-out'
            }}
            animate={{ x: item.x, y: item.y }}
            exit={{ x: '0vw', y: '0vh', opacity: 0 }}
          />
        ))}
        <motion.div
          className="px-4 md:px-0 space-y-4 relative z-10 text-center"
          style={{ scale: textScale }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold max-w-3xl"
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            Empowering the Next Generation of IT Professionals
          </motion.h1>
          <motion.p
            className="max-w-lg mx-auto text-sm sm:text-base md:text-lg lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
          </motion.p>
        </motion.div>
        <motion.div
          className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary opacity-10"
          style={{ 
            scale: scaleAndY, 
            y: useTransform(scaleAndY, [1, 1.5], ['0%', '-10%'])
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
        />
      </div>
    </motion.section>
  );
};

export default Banner;
