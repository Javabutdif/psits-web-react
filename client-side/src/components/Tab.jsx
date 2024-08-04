import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Tab = ({ tabs, activePath, styles}) => {
  return (
    <div className={`${styles} pt-2 md:p-0 border-b border-gray-300 bg-white shadow-sm`}>
      {tabs.map(tab => (
        <motion.div
          key={tab.path}
          whileHover={{ scale: 1.01 }}
          className={`relative flex items-center p-2 md:px-4 md:py-4 transition duration-150 ease-in-out ${activePath === tab.path ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500`}
        >
          <Link
            to={tab.path}
            className={`flex items-center space-x-2 text-sm sm:text-base ${activePath === tab.path ? 'font-semibold' : 'font-medium'}`}
          >
            <i className={`${tab.icon} text-base`} />
            <span>{tab.text}</span>
          </Link>
          {activePath === tab.path && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ type: 'bounce', stiffness: 500 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Tab;
