import akwe1 from "../assets/akwe/CCS 1 (4).jpg";
import akwe2 from "../assets/akwe/CCS 1 (5).jpg";
import akwe3 from "../assets/akwe/CCS 1 (6).jpg";
import akwe4 from "../assets/akwe/CCS 1 (7).jpg";
import akwe5 from "../assets/akwe/CCS 1 (11).jpg";
import akwe6 from "../assets/akwe/CCS 1 (12).jpg";
import akwe7 from "../assets/akwe/CCS 1 (13).jpg";
import akwe8 from "../assets/akwe/CCS 1 (14).jpg";
import akwe9 from "../assets/akwe/CCS 1 (15).jpg";
import akwe10 from "../assets/akwe/CCS 1 (17).jpg";
import akwe11 from "../assets/akwe/CCS 1 (35).jpg";
import akwe12 from "../assets/akwe/CCS 2 (9).jpg";
import akwe13 from "../assets/akwe/CCS 2 (22).jpg";
import akwe14 from "../assets/akwe/CCS 3 (2).jpg";
import akwe15 from "../assets/akwe/CCS 3 (3).jpg";
import akwe16 from "../assets/akwe/CCS 3 (23).jpg";
import akwe17 from "../assets/akwe/CCS 4 (9).jpg";
import akwe18 from "../assets/akwe/CCS 4 (10).jpg";
import akwe19 from "../assets/akwe/CCS 4 (12).jpg";
import akwe20 from "../assets/akwe/CCS 4 (25).jpg";
import akwe21 from "../assets/akwe/CCS 4 (26).jpg";
import akwe22 from "../assets/akwe/CCS 4 (28).jpg";
import Banner from "../components/sections/events/Banner";
import { motion, useAnimation } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

const imageArray = [
  akwe1,
  akwe2,
  akwe3,
  akwe4,
  akwe5,
  akwe6,
  akwe7,
  akwe8,
  akwe9,
  akwe10,
  akwe11,
  akwe12,
  akwe13,
  akwe14,
  akwe15,
  akwe16,
  akwe17,
  akwe18,
  akwe19,
  akwe20,
  akwe21,
  akwe22,
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
      setCurrentIndex((prevIndex) =>
        prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) {
      goToNext();
    } else if (info.offset.x > 100) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const getPreviousIndex = () =>
    currentIndex === 0 ? imageArray.length - 1 : currentIndex - 1;
  const getNextIndex = () =>
    currentIndex === imageArray.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="my-auto relative w-full max-w-4xl mx-auto pt-4">
      <div className="flex items-center justify-center space-x-4 pb-10">
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
          className="w-96"
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

      <div className="absolute  inset-x-0 bottom-0 flex justify-center space-x-2 pb-4">
        {imageArray.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3  h-3 rounded-full ${
              index === currentIndex ? "bg-primary" : "bg-gray-400"
            } transition-colors duration-300`}
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
        <div className="z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
          <div
            className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
            style={{ top: "5%", right: "5%" }}
          ></div>
          <div
            className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
            style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
          ></div>
          <div
            className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
            style={{ top: "60%", left: "80%" }}
          ></div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
            Thank You for Joining the CCS Acquaintance Party: A Night of
            Elegance
          </h2>
          <p className="text-base md:text-lg mb-4">
            On November 16, 2024, the CCS Acquaintance Party brought together
            students, faculty, and alumni at SM Seaside City Cebu for a night
            inspired by the timeless allure of the Old Money theme.
          </p>
          <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 text-base md:text-lg">
            <li>
              <strong>Sophisticated Entertainment: </strong> Live music and
              refined performances.
            </li>
            <li>
              <strong>Classic Activities:</strong> Fun games and experiences
              reflecting the old-money charm.
            </li>
            <li>
              <strong>Themed Photo Opportunities:</strong> Stunning moments
              captured in elegant settings.
            </li>
            <li>
              <strong>Networking in Style:</strong> Connections made in a
              luxurious atmosphere.
            </li>
          </ul>
          <p className="text-base md:text-lg">
            We extend our heartfelt gratitude to everyone who attended and made
            this event truly memorable. Until the next celebration!
          </p>
        </div>
        <Carousel />
      </section>
    </>
  );
};

export default Events;
