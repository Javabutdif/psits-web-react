import React, { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import deanImage from '../../../assets/images/dean.png'

const DeansMessage = () => {
  const messageData = useRef({
    name: 'Mr. Neil Basabe',
    position: "Dean - UC Main CSS",
    image: deanImage,
    message: `As the Dean of our esteemed college, I would like to extend a warm welcome to all of you. I am committed to supporting and guiding you throughout your academic journey. I want to create an inclusive and vibrant learning environment where you can grow and develop.

    I encourage you to take advantage of many opportunities available to you, both in and out of classroom. Participating in co-curricular and extracurricular activities, such as research, internship, hackathons, and ICT congresses, can provide you with practical, hands-on experiences that will enhance your problem-solving skills, foster creativity, and give you opportunities to collaborate with others. Extra curricular activities offer opportunities to apply your knowledge and skills in real-world settings beyond the classroom. By actively participating in these activities, you can develop not only technical expertise but also critical thinking communication and teamwork skills.

    I also encourage you to share your thoughts and ideas, collaborate with your peers, or simply come by to the college and say hello. Your feedback is important to us, and we are always working to improve our programs to meet your need.

    I commend you for choosing a field that is constantly changing and expanding. I wish you all the best in you academic and professional endeavors.`
  }).current;

  const [displayedMessage, setDisplayedMessage] = useState("");
  const typingSpeed = 10;
  const messageIndex = useRef(0);

  useEffect(() => {
    const typeMessage = () => {
      if (messageIndex.current < messageData.message.length) {
        setDisplayedMessage((prev) => prev + messageData.message.charAt(messageIndex.current));
        messageIndex.current++;
      }
    };

    const typingInterval = setInterval(typeMessage, typingSpeed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [messageData.message, typingSpeed]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-4xl relative lg:flex lg:justify-center lg:items-center"
    >
      <div className="flex flex-col sm:flex-row w-full lg:w-auto border-y-8 border-secondary pt-14 lg:p-8 px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-28 bg-white rounded-lg shadow-lg">
        <motion.div 
      
          className="absolute -top-20 left-1/3 -translate-x-3/4 bg-primary border-primary shadow-xl transform rounded-full"
        >
          <img
            src={messageData.image}
            alt={messageData.name}
            className="w-32 h-32 lg:w-40 lg:h-40 object-contain rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex-1"
        >
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-4 text-gray-800">Dean's Welcome Message</h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-gray-700 leading-relaxed mb-6"
          >
            <span className="font-semibold block mb-2 text-sm sm:text-md">Dear Students,</span>
            <span className="whitespace-pre-line text-xs sm:text-sm">
              {displayedMessage}
            </span>
          </motion.p>
          <div className="mt-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-gray-800 font-semibold text-md sm:text-lg"
            >
              {messageData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-gray-600 text-xs sm:text-sm"
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
