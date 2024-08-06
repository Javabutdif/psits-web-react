import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import deanImage from '../../../assets/images/dean.png';

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

  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const controls = useAnimation();

  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 300], ['30%', '-30%']);
  const rotateTransform = useTransform(scrollY, [0, 300], [0, 10]);

  useEffect(() => {
    const animateText = async () => {
      await controls.start({
        opacity: 1,
        transition: { duration: 0.5 }
      });

      for (let i = 0; i <= messageData.message.length; i++) {
        setDisplayedText(messageData.message.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 70));
      }
      setShowCursor(false);
    };

    animateText();
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [controls, messageData.message]);

  return (
    <div className="container px-4 lg:px-0 py-10 md:py-32">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        whileHover={{ scale: 1.05, rotate: rotateTransform }}
        style={{ y: yTransform }}
        className="relative max-w-4xl mx-auto bg-white p-4 md:p-6 shadow-lg"
      >
        <motion.div
          className="absolute inset-0 bg-white transform -rotate-2 translate-x-1 translate-y-1 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-b-0 border-l-0 border-gray-300"
          whileHover={{ translateX: 3, translateY: 3, rotate: -3 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
        <motion.div
          className="absolute inset-0 bg-white transform rotate-2 translate-x-2 translate-y-2 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-b-0 border-l-0 border-gray-400"
          whileHover={{ translateX: 6, translateY: 6, rotate: 3 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center mb-4 md:mb-6">
            <img
              src={messageData.image}
              alt={messageData.name}
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full object-top shadow-md mb-4 md:mb-0 md:mr-6"
            />
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{messageData.name}</h2>
              <h3 className="text-md text-gray-600">{messageData.position}</h3>
            </div>
          </div>
          <div className="text-justify">
            <p className="text-sm md:text-base leading-relaxed">
              {displayedText}
              {showCursor && "|"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeansMessage;
