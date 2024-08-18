import React, { useState, useEffect, useRef } from 'react';
import Banner from '../components/sections/events/Banner'
import { motion, useAnimation } from 'framer-motion';

const imageArray = [
  "https://via.placeholder.com/300x200.png?text=Image+1",
  "https://via.placeholder.com/300x200.png?text=Image+2",
  "https://via.placeholder.com/300x200.png?text=Image+3",
  "https://via.placeholder.com/300x200.png?text=Image+4",
  "https://via.placeholder.com/300x200.png?text=Image+5",
  "https://via.placeholder.com/300x200.png?text=Image+6"
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const intervalRef = useRef(null);

  useEffect(() => {
    startAutoplay();

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, []);

  useEffect(() => {
    controls.start({ opacity: 1 });
  }, [currentIndex]);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1));
    }, 3000); // Change image every 3 seconds
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) {
      goToNext();
    } else if (info.offset.x > 100) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const getPreviousIndex = () => (currentIndex === 0 ? imageArray.length - 1 : currentIndex - 1);
  const getNextIndex = () => (currentIndex === imageArray.length - 1 ? 0 : currentIndex + 1);

  return (
    <div className="my-auto relative w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center space-x-4">
        <motion.div
          className="w-1/4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={imageArray[getPreviousIndex()]}
            alt="Previous"
            className="w-full h-auto"
          />
        </motion.div>
        
        <motion.div
          className="w-1/2"
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          <img
            src={imageArray[currentIndex]}
            alt="Current"
            className="w-full h-auto"
          />
        </motion.div>
        
        <motion.div
          className="w-1/4"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={imageArray[getNextIndex()]}
            alt="Next"
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center space-x-2 pb-4">
        {imageArray.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-gray-400'} transition-colors duration-300`}
          />
        ))}
      </div>
    </div>
  );
};


const Events = () => {
  return (
    <>
      <Banner />
      <section className="px-4 min-h-screen container py-14 flex flex-col md:py-24">
        <div className="z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary text-neutral-light p-4 md:p-6 shadow-md w-full">
          {/* Small squares with custom colors and opacity */}
          <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30" style={{ top: '5%', right: '5%' }}></div>
          <div className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}></div>
          <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30" style={{ top: '60%', left: '80%' }}></div>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Join Us for the Annual ICT Congress</h2>
          <p className="text-base md:text-lg mb-4">The ICT Congress is a premier event uniting IT professionals, students, and enthusiasts for a dynamic series of workshops, panels, and networking opportunities. Designed to inspire innovation and foster connections, this event offers:</p>
          <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 text-base md:text-lg">
            <li><strong>Keynote Speeches:</strong> Hear from leading industry experts</li>
            <li><strong>Hands-On Workshops:</strong> Engage in practical training sessions</li>
            <li><strong>Panel Discussions:</strong> Discover the latest IT trends</li>
            <li><strong>Networking Events:</strong> Connect with peers and professionals</li>
          </ul>
          <p className="text-base md:text-lg">Since its inception, the ICT Congress has attracted over 5,000 participants, featured more than 200 speakers, and facilitated numerous professional connections and collaborations.</p>
        </div>
        <Carousel />
      </section>
      <section className="px-4 min-h-screen container py-14 flex flex-col md:py-24">
        <div className="z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary text-neutral-light p-4 md:p-6 shadow-md w-full">
          {/* Small squares with custom colors and opacity */}
          <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30" style={{ top: '5%', right: '5%' }}></div>
          <div className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}></div>
          <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30" style={{ top: '60%', left: '80%' }}></div>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Join Us for the Annual ICT Congress</h2>
          <p className="text-base md:text-lg mb-4">The ICT Congress is a premier event uniting IT professionals, students, and enthusiasts for a dynamic series of workshops, panels, and networking opportunities. Designed to inspire innovation and foster connections, this event offers:</p>
          <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 text-base md:text-lg">
            <li><strong>Keynote Speeches:</strong> Hear from leading industry experts</li>
            <li><strong>Hands-On Workshops:</strong> Engage in practical training sessions</li>
            <li><strong>Panel Discussions:</strong> Discover the latest IT trends</li>
            <li><strong>Networking Events:</strong> Connect with peers and professionals</li>
          </ul>
          <p className="text-base md:text-lg">Since its inception, the ICT Congress has attracted over 5,000 participants, featured more than 200 speakers, and facilitated numerous professional connections and collaborations.</p>
        </div>
        <Carousel />
      </section>
      
    </>
  )
}

export default Events
