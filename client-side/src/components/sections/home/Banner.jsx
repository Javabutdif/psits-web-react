import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import bannerImage from '../../../assets/images/banner.png'


const Banner = () => {


  return (
    <motion.section
      className="relative -z-10 bg-[#4398AC] py-24 md:py-28 flex items-center justify-center "
    >
      {/* <img src={bannerImage} className="absolute w-full h-full object-cover" alt="" /> */}

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/path-to-your-image.jpg")' }} />
      </motion.div>
      <motion.div
        className="relative z-10 max-w-5xl text-start md:text-center px-4 space-y-6 md:space-y-8"
      >
        <h1 className="text-5xl lg:text-6xl xl:text-8xl font-extrabold text-white">
          Empowering the Next Generation of IT Professionals
        </h1>
        <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-white">
          Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
        </p>
      </motion.div>
      <svg className="absolute -bottom-0 translate-y-fulls" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 18">
        <path d="M375.303 0c0 0-93.054 17.7075-187.13 17.7075C94.0966 17.7075 0 0 0 0Z" fill="#4398AC "></path>
      </svg>

    </motion.section>
  );
};

export default Banner;
