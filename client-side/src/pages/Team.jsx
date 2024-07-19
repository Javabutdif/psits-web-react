import React, { useState } from 'react';
import { motion } from 'framer-motion';
import jims from "../assets/images/jims.jpg";
import kirby from "../assets/images/kirby.gif";
import hutao from "../assets/images/hutao.gif";
import cat from "../assets/images/cat.gif";

const teamMembers = [
  { name: 'Jims', image: jims, label: 'Lead Developer' },
  { name: 'Beans', image: kirby, label: 'Front End Developer' },
  { name: 'Hutao', image: hutao, label: 'Backend Developer' },
  { name: 'Cat', image: cat, label: 'Web Designer' },
];

const Team = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % teamMembers.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + teamMembers.length) % teamMembers.length);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      goToPrevious();
    } else if (info.offset.x < -100) {
      goToNext();
    }
  };

  return (
    <div className="min-h-screen p-12 flex flex-col gap-20 items-center justify-center relative overflow-hidden">
        <h1 className="text-2xl md:text-7xl font-bold">The Team</h1>
      <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">

        {teamMembers.map((member, index) => {
          const isCurrent = index === currentIndex;
          const isPrevious = index === (currentIndex - 1 + teamMembers.length) % teamMembers.length;
          const isNext = index === (currentIndex + 1) % teamMembers.length;

          return (
            <motion.div
              key={index}
              className={`absolute bg-white rounded-3xl shadow-lg overflow-hidden ${isCurrent ? 'z-10 scale-100' : 'z-5 scale-75'}`}
              initial={{
                x: isPrevious ? '-120%' : (isNext ? '120%' : '0'),
                opacity: isCurrent ? 1 : 0.4,
                scale: isCurrent ? 1 : 0.75,
                rotate: isPrevious ? -10 : (isNext ? 10 : 0),
              }}
              animate={{
                x: isCurrent ? '0%' : (isPrevious ? '-60%' : (isNext ? '60%' : '0%')),
                opacity: isCurrent ? 1 : 0.4,
                scale: isCurrent ? 1 : 0.75,
                rotate: isCurrent ? 0 : (isPrevious ? -10 : (isNext ? 10 : 0)),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ width: '320px', height: '420px' }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-3/4 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-3xl font-bold mb-2 text-gray-800">{member.name}</h3>
                <p className="text-gray-600 text-base">{member.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
