import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useAnimation, delay } from 'framer-motion';
import deanImage from '../../../assets/images/dean.png';

const messageData = {
  name: 'Mr. Neil Basabe',
  position: 'Dean - UC Main CSS',
  message: `As the Dean of our esteemed college, we're thrilled to have you here. I am committed to fostering a supportive and dynamic learning environment where you can thrive. Explore the many opportunities available, from internships to hackathons, to gain valuable real-world experience and develop your skills. We encourage active participation and collaboration – your voice matters! We're here to help you succeed in this ever-evolving field.

    \nBest wishes for an amazing academic journey!`,
};

const DeansMessage = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [startTyping, setStartTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const controls = useAnimation();

  // Handle window size changes
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });
  const isMobile = windowSize.width <= 768;
  const isTablet = windowSize.width <= 1024;

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setAnimationComplete(true);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [isInView]);

  useEffect(() => {
    const animateText = async () => {
      await controls.start({ opacity: 1, transition: { duration: 0.5 } });

      for (let i = 0; i <= messageData.message.length; i++) {
        setDisplayedText(messageData.message.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      setShowCursor(false);
    };

    if (animationComplete) {
      setStartTyping(true);
      animateText();
    }
  }, [controls, messageData.message, animationComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      if (startTyping) {
        setShowCursor(prev => !prev);
      }
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [startTyping]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-0">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5,
          type: 'spring',
          stiffness: 120,
          damping: 10, }}
        className="absolute w-full left-0 top-1/2 transform -translate-y-1/2"
      >
        <h3 className="text-2xl md:text-4xl text-center font-bold text-gray-800">
          Dean's Welcome Message
        </h3>
      </motion.div>

      {animationComplete && (
        <div className="w-full py-20 md:py-40">
          <motion.div
            className="relative w-full flex flex-col justify-center items-center"
            initial={{
              opacity: 0,
              x: isMobile ? 0 : isTablet ? 90 : 300,
              y: isMobile ? 120 : isTablet ? -24 : 90,
            }}
            animate={{
              opacity: 1,
              x: isMobile || isTablet ? 0  : 200,
              y: 0,
            }}
            transition={{
              delay: 0.9,
              duration: 1.2,
              ease: 'easeInOut',
              type: 'spring',
              stiffness: 120,
              damping: 10,
            }}
          >
          <div className="relative flex items-center justify-center">
              {/* Background Layer */}
              <motion.div
                className="absolute w-80 h-80 bg-primary rounded-full shadow-lg"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: isMobile || isTablet ? 0 : -700,
                  y: isMobile || isTablet ? 100 : 20,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0.7,
                  scale: 1,
                  x: isMobile || isTablet ? 0 : -400,
                  y: isMobile || isTablet ? 70 : 150,
                  rotate: 45,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 80,
                  damping: 12,
                  delay: 1,
                }}
                style={{ backgroundColor: '#4398AC' }}  // Primary color
              />
              
              {/* Foreground Layer */}
              <motion.div
                className="relative z-20 w-52 h-52 bg-secondary rounded-full shadow-2xl overflow-hidden"
                initial={{
                  opacity: 0,
                  x: isMobile || isTablet? 0 : -680,
                  y: isMobile || isTablet ? 80 : 20,
                }}
                animate={{
                  opacity: 1,
                  x: isMobile || isTablet? 0 : -370,
                  y: isMobile || isTablet ? 50 : 150,
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 120,
                  damping: 10,
                  delay: 1.5,
                }}
                style={{ backgroundColor: '#A4CDD7' }}  // Secondary color
              >
                <img src={deanImage} className="object-cover object-top w-full h-full" alt="Dean" />
              </motion.div>

              {/* Accent Layer */}
              <motion.div
                className="absolute -z-10 w-64 h-64 bg-accent rounded-full shadow-md"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  x: isMobile || isTablet ? 0 : -650,
                  y: isMobile || isTablet ? 90 : 20,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0.6,
                  scale: 1,
                  x: isMobile || isTablet ? 0 : -380,
                  y: isMobile || isTablet ? 60 : 150,
                  rotate: -20,
                }}
                transition={{
                  duration: 2.2,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 90,
                  damping: 11,
                  delay: 1.3,
                }}
                style={{ backgroundColor: '#002E48' }}  // Accent color
              />
            </div>

            <div className="relative z-10 bg-white p-8 pt-20 lg:pt-8 lg:pl-20 w-full max-w-xl shadow-lg overflow-hidden">
              {/* Background Layer */}
              <motion.div
                className="absolute inset-0 bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              
              {/* Accent Layer */}
              <motion.div
                className="absolute inset-0 bg-primary"
                initial={{ opacity: 0, x: -5, y: 5 }}
                animate={{ opacity: 0.05, x: 0, y: 0 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />

              {/* Content Layer */}
              <motion.div
                className="relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <div className="text-gray-800 space-y-6 text-justify text-lg font-medium">
                  <span className="text-sm leading-relaxed mb-4">
                    {startTyping && (
                      <>
                        {displayedText}
                        {showCursor && '|'}
                      </>
                    )}
                  </span>
                  <motion.div 
                    className="text-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2 }}
                  >
                    <h2 className="text-md font-bold text-primary">
                      {messageData.name}
                    </h2>
                    <h3 className="text-xs font-medium text-gray-600">
                      {messageData.position}
                    </h3>
                  </motion.div>
                </div>
              </motion.div>

              {/* Decorative Element */}
              <motion.div
                className="absolute top-0 right-0 w-24 h-24 bg-secondary"
                initial={{ opacity: 0, x: 20, y: -20 }}
                animate={{ opacity: 0.1, x: 0, y: 0 }}
                transition={{ duration: 1.5, delay: 1.2 }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default DeansMessage;
