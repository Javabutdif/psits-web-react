import React from 'react';
import { motion } from 'framer-motion';
import ucLogo from '../../../assets/images/UC_logo 1.png';
import ccsLogo from '../../../assets/images/ccs.png';

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Adjust the stagger delay as needed
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CoreBeliefs = () => {
  return (
    <div className="max-w-[1000px] mx-auto overflow-hidden">
      {/* University of Cebu Section */}
      <motion.section
        className="space-y-5 py-10 md:py-20"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <motion.div
          className="flex flex-col items-center space-y-2"
          variants={childVariants}
        >
          <img src={ucLogo} alt="University of Cebu logo" className="w-12 md:w-14" />
          <h3 className="text-xl md:text-2xl font-bold">University of Cebu</h3>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 ">
          <motion.div
            className="flex-1 bg-primary md:-translate-y-6 text-white p-4 md:p-8 rounded-lg"
            variants={childVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mission</h3>
            <p className="text-sm md:text-base">
              The University offers affordable and quality education responsive to the demands of local and international communities.
            </p>
          </motion.div>
          <motion.div
            className="flex-1 md:translate-y-6 px-2 py-4 md:p-8 rounded-lg border"
            variants={childVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Vision</h3>
            <p className="text-sm md:text-base">
              Democratize quality education. Be the visionary and industry leader. Give hope and transform lives.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* College of Computer Studies Section */}
      <motion.section
        className="grid flex-col md:flex-row space-y-5 py-10 md:py-20"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <motion.div
          className="flex flex-col items-center space-y-2"
          variants={childVariants}
        >
          <img src={ccsLogo} alt="College of Computer Studies logo" className="w-12 md:w-14" />
          <h3 className="text-xl md:text-2xl font-bold">College of Computer Studies</h3>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 ">
          <motion.div
            className="p-4 md:p-8 rounded-lg border"
            variants={childVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mission</h3>
            <p className="text-sm md:text-base">
              We envision being the hub of quality, globally-competitive, and socially-responsive information technology education.
            </p>
          </motion.div>
          <motion.div
            className="bg-primary self-center text-white px-2 py-4 md:p-8 rounded-lg"
            variants={childVariants}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Vision</h3>
            <p className="text-sm md:text-base">
              <strong className="block">We commit to continuously:</strong>
              Offer relevant programs that mold well-rounded computing professionals;
              Engage in accreditation and quality standards;
              Facilitate in building an IT-enabled nation.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="py-10 md:py-20 text-center space-y-4 px-2"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Goals</h3>
          <p className="text-base md:text-lg text-gray-700">
            We aim to cultivate a teaching-learning environment that:
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <motion.div
            className="bg-primary text-white border flex items-center border-gray-200 rounded-lg shadow-md p-4 md:p-6 transition-transform transform hover:scale-105"
            variants={childVariants}
          >
            <p className="text-sm md:text-base font-medium ">
              Promotes scholarly endeavors for the promotion of moral, social, cultural, and environmental interests.
            </p>
          </motion.div>
          <motion.div
            className="bg-white border flex items-center border-gray-200 rounded-lg shadow-md p-4 md:p-6 transition-transform transform hover:scale-105"
            variants={childVariants}
          >
            <p className="text-sm md:text-base font-medium text-gray-800">
              Meets the demands of the industry in terms of technical, personal, and interpersonal skills.
            </p>
          </motion.div>
          <motion.div
            className="bg-primary text-white border flex items-center border-gray-200 rounded-lg shadow-md p-4 md:p-6 transition-transform transform hover:scale-105"
            variants={childVariants}
          >
            <p className="text-sm md:text-base font-medium ">
              Conducts intellectual, technological, and significant research in computing.
            </p>
          </motion.div>
          <motion.div
            className="bg-white border flex items-center border-gray-200 rounded-lg shadow-md p-4 md:p-6 transition-transform transform hover:scale-105"
            variants={childVariants}
          >
            <p className="text-sm md:text-base font-medium text-gray-800">
              Optimizes the use of appropriate and advanced resources and services.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Core Values Section */}
      <motion.section
        className="py-10 px-2 md:py-20 text-center"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <div className="mb-8">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-5 text-gray-800">Core Values</h3>
          <p className="text-sm md:text-base text-gray-600">These are the core values that CCS believes in:</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={childVariants}
          >
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Initiative (Inceptum)</h4>
            <p className="text-gray-600">Wit, Practicality, Ingenuity</p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={childVariants}
          >
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Innovation (Innovatio)</h4>
            <p className="text-gray-600">Technology, Creativity, Novelty</p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2"
            variants={childVariants}
          >
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Service (Muneris)</h4>
            <p className="text-gray-600">Industry, Loyalty, Courtesy</p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default CoreBeliefs;
