import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Tab = ({ tabs, activePath}) => {
  return (
    <div className={` border-b border-gray-200 bg-white`}>
      <div className="relative flex items-center">
        {tabs.map(tab => (
          <motion.div
            key={tab.path}
            whileHover={{ scale: 1.01 }}
            className={`flex-1 relative flex items-center p-3 transition duration-150 ease-in-out ${activePath === tab.path ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600'} hover:text-blue-600`}
          >
            <Link
              to={tab.path}
              className={`flex items-center space-x-2 text-sm sm:text-base ${activePath === tab.path ? 'font-semibold' : 'font-medium'}`}
              aria-current={activePath === tab.path ? 'page' : undefined}
            >
              <i className={`${tab.icon} text-lg`} />
              <span>{tab.text}</span>
            </Link>
            {activePath === tab.path && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tab;
