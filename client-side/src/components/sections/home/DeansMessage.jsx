import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DeansMessage = () => {
  const messageData = {
    name: 'Mr. Neil Basabe',
    position: "Dean - UC Main CSS",
    image: "https://th.bing.com/th?id=OIP.YjJSBQVO5Cy9RBxwNqfj7AHaJ5&w=216&h=289&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2",
    message: `As the Dean of our esteemed college, we're thrilled to have you here. I am committed to fostering a supportive and dynamic learning environment where you can thrive. Explore the many opportunities available, from internships to hackathons, to gain valuable real-world experience and develop your skills. We encourage active participation and collaboration – your voice matters! We're here to help you succeed in this ever-evolving field.

      Best wishes for an amazing academic journey!`
  };

  const [displayedMessage, setDisplayedMessage] = useState([]);
  const typingSpeed = 30;

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
    <div className="mt-24 sm:mt-40 md:mt-52 xl:mt-72 py-24 lg:py-32 xl:py-52 ">
      <div className="container mx-auto max-w-3xl relative px-8 lg:flex lg:justify-center lg:items-center">
        <div className="absolute -top-20 left-1/2 transform rounded-full -translate-x-1/2">
          <img
            src={messageData.image}
            alt={messageData.name}
            className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full border-4 border-blue-500 shadow-xl"
          />
        </div>
        <motion.div 
          className="w-full lg:w-auto border-l-8 md:border-l-0 md:border-t-8 border-blue-500 pt-20 px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-30 bg-white rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 text-center">Dean's Welcome Message</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            <span className="font-semibold block mb-2 text-lg">Dear Students,</span>
            <span className="whitespace-pre-line">
              {displayedMessage.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </p>
          <div className="text-center mt-6">
            <p className="text-gray-800 font-semibold text-xl">{messageData.name}</p>
            <p className="text-gray-600">{messageData.position}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeansMessage;
