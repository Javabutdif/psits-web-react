import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion'

const DeansMessage = () => {
  const messageData = {
    name: 'Mr. Neil Basabe',
    position: "Dean - UC Main CSS",
    image: "https://th.bing.com/th?id=OIP.YjJSBQVO5Cy9RBxwNqfj7AHaJ5&w=216&h=289&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2",
    message: `As the Dean of our esteemed college, we're thrilled to have you here. 

      Best wishes for an amazing academic journey!`
  };

  const [displayedMessage, setDisplayedMessage] = useState([]);
  const typingSpeed = 250;

  useEffect(() => {
    let index = 0;
    const typeMessage = () => {
      if (index < messageData.message.length) {
        setDisplayedMessage((prev) => [...prev, messageData.message.charAt(index)]);
        index++;
        setTimeout(typeMessage, typingSpeed);
      }
    };
    typeMessage();

    return () => {
      index = messageData.message.length; // Stop typing if the component unmounts
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-xl relative lg:flex lg:justify-center lg:items-center"
    >
      <div className="flex flex-col sm:flex-row w-full lg:w-auto border-y-8 border-secondary pt-14 lg:p-8 px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-28 bg-white rounded-lg shadow-lg">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 20, damping: 12 }}
          className="absolute -top-20 border- border-secondary shadow-xl transform rounded-full"
        >
          <img
            src={messageData.image}
            alt={messageData.name}
            className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex-1"
        >
          <h2 className="text-lg sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">Dean's Welcome Message</h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-gray-700 leading-relaxed mb-6"
          >
            <span className="font-semibold block mb-2 text-md sm:text-lg">Dear Students,</span>
            <span className="whitespace-pre-line text-sm sm:text-md">
              {displayedMessage.map((char, index) => (
                <span key={index}>{char}</span>
              ))}
            </span>
          </motion.p>
          <div className="mt-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-gray-800 font-semibold text-lg sm:text-xl"
            >
              {messageData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-gray-600 text-sm sm:text-md"
            >
              {messageData.position}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DeansMessage;
