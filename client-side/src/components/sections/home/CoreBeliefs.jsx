import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../../assets/images/UC_logo 1.png';

const coreBeliefsData = {
  missions: [
    'The University offers affordable and quality education responsive to the demands of local and international communities.',
    'We envision being the hub of quality, globally-competitive and socially-responsive information technology education'
  ],
  visions: [
    'Offer relevant programs that mold well-rounded computing professionals;',
    `Engage in accreditation and quality standards;
    and Facilitate in building an IT-enabled nation`
  ],
  goals: [
    'Promotes scholarly endeavors for the promotion of moral, social, cultural, and environmental interests;',
    'Meets the demands of the industry in terms of technical, personal and interpersonal skills;',
    'Conducts intellectual, technological and significant researches in computing; and',
    'Optimizes the use of appropriate and advanced resources and services.'
  ],
  values: [
    {
      title: 'Initiative (Inceptum)',
      meaning: 'Wit, Practicality, Ingenuity'
    },
    {
      title: 'Innovation (Innovatio)',
      meaning: 'Technology, Creativity, Novelty'
    },
    {
      title: 'Service (Muneris)',
      meaning: 'Industry, Loyalty, Courtesy'
    }
  ]
};

const CoreBeliefs = () => {
  return (
    <div className="py-12 md:py-20 lg:py-32 relative">
      {/* Background */}
      <div className="relative h-80 md:h-96">
        <div className="absolute top-0 -left-2 bottom-0 right-0 w-full h-full overflow-hidden -rotate-2 bg-gradient-to-r from-[#074873] to-transparent z-0">
          <img src={logo} className="absolute top-0 right-0 h-full opacity-20" alt="Background Logo" />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
          {/* Mission and Vision */}
          <div className="max-w-md text-center text-white">
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold">Mission</h3>
              <p className="mt-4 text-sm md:text-base lg:text-lg leading-6 text-gray-100">{coreBeliefsData.missions[0]}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold">Vision</h3>
              <p className="mt-4 text-sm md:text-base lg:text-lg leading-6 text-gray-100">{coreBeliefsData.visions[0]}</p>
            </div>
          </div>
        </div>
      </div>
      <div className='pt-28'>
        
      {/* Additional Mission and Vision */}
      <div className="container mx-auto py-12 md:py-20 px-4 flex gap-4 flex-col md:flex-row justify-center items-stretch">
        <div className="max-w-[400px]">
          <h3 className="text-2xl md:text-3xl font-bold">Mission</h3>
          <p className="mt-4 text-sm md:text-base lg:text-lg leading-6 text-gray-800">{coreBeliefsData.missions[1]}</p>
        </div>
        <div className="max-w-[400px] mt-8 md:mt-0">
          <h3 className="text-2xl md:text-3xl font-bold">Vision</h3>
          <p className="mt-4 text-sm md:text-base lg:text-lg leading-6 text-gray-800">{coreBeliefsData.visions[1]}</p>
        </div>
      </div>

      {/* Goals */}
      <div className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-12 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Goals</h3>
          <p className="text-sm md:text-base lg:text-lg leading-6 text-gray-600">We aim to cultivate a teaching-learning environment that:</p>
        </div>
        <div className="flex flex-wrap justify-center items-stretch">
          {coreBeliefsData.goals.map((goal, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-4 mb-8">
              <div className="bg-white shadow-md rounded-lg p-6 text-center h-full">
                <p className="text-sm md:text-base lg:text-lg leading-6 text-gray-800 mb-4">{goal}</p>
                {index < coreBeliefsData.goals.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 mx-auto w-1 h-10 bg-gray-300 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="container mx-auto py-12 md:py-20 px-4 flex flex-col md:flex-row justify-evenly items-center">
        <div className="mb-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Core Values</h3>
          <p className="text-sm md:text-base lg:text-lg leading-6 text-gray-600">These are the core values that CCS believes in:</p>
        </div>
        <div className="flex flex-col gap-4 text-center">
          {coreBeliefsData.values.map((value, index) => {
            let bgColor, textColor;
            if (value.title.includes('Inceptum')) {
              bgColor = 'bg-green-500';
              textColor = 'text-green-900';
            } else if (value.title.includes('Innovatio')) {
              bgColor = 'bg-blue-500';
              textColor = 'text-blue-900';
            } else if (value.title.includes('Muneris')) {
              bgColor = 'bg-purple-500';
              textColor = 'text-purple-900';
            }

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-lg shadow-lg transition-transform duration-300 ${bgColor}`}
              >
                <h4 className={`text-2xl md:text-3xl font-semibold mb-2 ${textColor}`}>{value.title}</h4>
                <p className="text-gray-100 text-sm md:text-base lg:text-lg leading-6">{value.meaning}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

export default CoreBeliefs;
