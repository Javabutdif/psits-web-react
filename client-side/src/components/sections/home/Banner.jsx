import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence} from 'framer-motion';
import particle from '../../../assets/images/download.png'

const Banner = () => {
  
  return (
    <AnimatePresence>
    <motion.div  
    className='font-montserrat relative bg-[#074873] text-white '>
        <img src={particle} alt="" className='absolute w-full object-cover h-screen  top-1/2 -translate-y-1/2'/>
        <div className='text-center items-center lg:text-start relative min-h-[80vh] lg:min-h-[65vh] container  py-24 px-4 mx-auto flex '> 
          <div className='z-40 -mb-20 lg:-mb-36'>
            <h1 className="text-5xl md:text-6xl  drop-shadow-2xl lg:text-7xl font-bold max-w-full lg:max-w-[800px] mb-8  tracking-wide text-transparent text-white">
                Empowering the Next Generation of IT Professionals
            </h1>

                <p className='font-roboto max-w-full leading-6 tracking-wider lg:max-w-[600px] mb-10'>
                   Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
                </p>
                <Link to={"/register"}>
                  <motion.button
                    whileHover={{scale: 1.1, rotate: '-3deg'}}
                    whileTap={{ scale: 0.9 }}
                    className="bg-blue-500 hover:bg-blue-400 -z-30 text-white font-bold py-2 px-4 rounded"
                  >
                      Get Membership
                  </motion.button>
                </Link>
            </div>
            

        </div>
        <svg className='absolute -mt-2 lg:-mt-6 -z-10' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
  <path fill="#074873" fill-opacity="1" d="M0,160L26.7,149.3C53.3,139,107,117,160,117.3C213.3,117,267,139,320,154.7C373.3,171,427,181,480,202.7C533.3,224,587,256,640,272C693.3,288,747,288,800,272C853.3,256,907,224,960,192C1013.3,160,1067,128,1120,138.7C1173.3,149,1227,203,1280,218.7C1333.3,235,1387,213,1413,202.7L1440,192L1440,0L1413.3,0C1386.7,0,1333,0,1280,0C1226.7,0,1173,0,1120,0C1066.7,0,1013,0,960,0C906.7,0,853,0,800,0C746.7,0,693,0,640,0C586.7,0,533,0,480,0C426.7,0,373,0,320,0C266.7,0,213,0,160,0C106.7,0,53,0,27,0L0,0Z"></path>
</svg>
    </motion.div>
    </AnimatePresence>

  )
}

export default Banner
