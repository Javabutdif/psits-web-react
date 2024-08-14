import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import deanImage from '../../../assets/images/dean.png';

const DeansMessage = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageWithDelay, setShowMessageWithDelay] = useState(false); // New state for delayed message
  const { ref: headingRef, inView } = useInView({ triggerOnce: true });
  const messageRef = useRef(null);
  const containerRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight); // Added height

  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [startTyping, setStartTyping] = useState(false);
  const controls = useAnimation();

  const messageData = {
    name: 'Mr. Neil Basabe',
    position: "Dean - UC Main CSS",
    image: deanImage,
    message: `As the Dean of our esteemed college, we're thrilled to have you here. I am committed to fostering a supportive and dynamic learning environment where you can thrive. Explore the many opportunities available, from internships to hackathons, to gain valuable real-world experience and develop your skills. We encourage active participation and collaboration – your voice matters! We're here to help you succeed in this ever-evolving field.

    Best wishes for an amazing academic journey!`
  };

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight); // Update viewport height on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (inView) {
      setShowMessage(true);
    }
  }, [inView]);

  useEffect(() => {
    const animateText = async () => {
      await controls.start({
        opacity: 1,
        transition: { duration: 0.5 }
      });

      for (let i = 0; i <= messageData.message.length; i++) {
        setDisplayedText(messageData.message.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      setShowCursor(false);
    };

    if (startTyping) {
      animateText();
    }
  }, [controls, messageData.message, startTyping]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      if (startTyping) {
        setShowCursor(prev => !prev);
      }
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [startTyping]);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessageWithDelay(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  // Calculate dynamic x and y values
  const dynamicX = viewportWidth < 768 ? '50%' : '150%'; // Adjust based on viewport width
  const dynamicY = viewportHeight < 600 ? '-100px' : '0px'; // Adjust based on viewport height

  return (
    <div ref={containerRef} className="container px-4 py-40 min-h-screen flex flex-col justify-center items-center">
      <motion.h3
        ref={headingRef}
        initial={{ opacity: 1 }}
        animate={{ opacity: inView ? 0 : 1, scale: inView ? 1 : 2 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        onAnimationComplete={() => setStartTyping(true)}
        className="text-center text-xl md:text-3xl font-extrabold uppercase text-gray-800 mb-6"
      >
        {"Dean's Welcome Message".split(' ').map((item, index) => (
          <span key={index}>
            {item}{' '}
          </span>
        ))}
      </motion.h3>
      {showMessageWithDelay && (
        <motion.div
          ref={messageRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative pt-40 -mt-20 md:-mt-24"
        >
          <motion.div
              className="w-52 h-52 absolute z-10  -top-1 left-1/2 -translate-x-1/2 md:top-32 md:left-20 overflow-hidden rounded-full bg-[#A4CDD7]">
            <img
              src={messageData.image}
              alt={messageData.name}
              className="w-full"
            />
          </motion.div>
          <motion.div
            className="bg-[#4398AC] z-20 relative text-white md:mt-24 md:ml-24 shadow-lg overflow-hidden max-w-lg mx-auto p-6 md:p-8"
          >
            <p className="text-justify text-sm leading-relaxed mb-4">
              {startTyping && (
                <>
                  {displayedText}
                  {showCursor && "|"}
                </>
              )}
            </p>
            <div className="text-center lg:text-start">
              <h2 className="text-md font-bold text-white-800">{messageData.name}</h2>
              <h3 className="text-xs font-medium text-slate-200">{messageData.position}</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DeansMessage;
