import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
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

  useEffect(() => {
    const animateText = async () => {
      await controls.start({
        opacity: 1,
        transition: { duration: 0.5 }
      });

      for (let i = 0; i <= messageData.message.length; i++) {
        setDisplayedText(messageData.message.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 70)); // Adjust typing speed here
      }
      
      // Stop blinking cursor after typing is complete
      setShowCursor(false);
    };

    animateText();

    // Blink cursor
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500); // Blink every 500ms

    return () => clearInterval(cursorInterval);
  }, [controls, messageData.message]);

  return (
    <div className="container px-4 lg:px-0 py-20">
      <div className="max-w-4xl mx-auto bg-white p-4">
        <div className="flex items-center mb-6">
            <img src={messageData.image} alt={messageData.name} className="w-20 h-20 object-cover rounded-full object-top  mr-4" />
            <div>
            <h2 className="text-xl font-bold">{messageData.name}</h2>
            <p className="text-sm text-gray-600">{messageData.position}</p>
            </div>
        </div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            className=""
        >
            <p className="text-gray-800 text-xs md:text-sm whitespace-pre-line">
            <span className="font-bold text-md block mb-4">Dear Students,</span>
            {displayedText}
            {showCursor && <span className="animate-blink">|</span>}
            </p>
        </motion.div>
        </div>
      </div>
  );
};

export default DeansMessage;