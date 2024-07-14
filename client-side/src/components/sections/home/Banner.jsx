import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import particle from '../../../assets/images/download.png';

const Banner = () => {
  return (
    <AnimatePresence>
      <motion.div className='relative bg-[#074873] text-white'>
        <img src={particle} alt="Background" className='absolute top-1/2 -translate-y-1/2 w-full object-cover h-screen' />
        <div className='relative min-h-[80vh] lg:min-h-[65vh] flex items-center justify-center lg:justify-start text-center lg:text-left container mx-auto px-4 py-24'>
          <div className='z-40 -mb-20 md:-mb-30 lg:-mb-40 xl:-mb-52'>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-wide text-white drop-shadow-2xl max-w-full lg:max-w-[800px]">
              Empowering the Next Generation of IT Professionals
            </h1>
            <p className='font-roboto text-sm sm:text-base md:text-lg lg:text-xl leading-6 tracking-wider mb-10 max-w-full lg:max-w-[600px]'>
              Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.1, rotate: '-3deg' }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
              >
                Get Membership
              </motion.button>
            </Link>
          </div>
        </div>
        <svg className='absolute -mt-2 -z-10' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#074873" fillOpacity="1" d="M0,160L26.7,149.3C53.3,139,107,117,160,117.3C213.3,117,267,139,320,154.7C373.3,171,427,181,480,202.7C533.3,224,587,256,640,272C693.3,288,747,288,800,272C853.3,256,907,224,960,192C1013.3,160,1067,128,1120,138.7C1173.3,149,1227,203,1280,218.7C1333.3,235,1387,213,1413,202.7L1440,192V0H1413.3C1386.7,0,1333,0,1280,0C1226.7,0,1173,0,1120,0C1066.7,0,1013,0,960,0C906.7,0,853,0,800,0C746.7,0,693,0,640,0C586.7,0,533,0,480,0C426.7,0,373,0,320,0C266.7,0,213,0,160,0C106.7,0,53,0,27,0H0Z"></path>
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}

export default Banner;
