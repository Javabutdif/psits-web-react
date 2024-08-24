import React from 'react';
import { motion } from 'framer-motion';

const CarouselCard = ({ member, isCurrent, isNext, isPrevious, onDragEnd }) => (
  <motion.div
    key={member.name}
    whileHover={{ scale: isCurrent ? 1.2 : 0.8 }}
    className={`w-[220px] h-[320px] md:w-[320px] md:h-[420px] absolute bg-white rounded-3xl shadow-lg overflow-hidden ${
      isCurrent ? "z-10 scale-100" : isPrevious || isNext ? "z-20 " : "z-5 scale-75" 
    } `}
    initial={{  
      
      x: isPrevious ? "-120%" : isNext ? "120%" : "0%",
      opacity: isCurrent ? 1 : 0.4, // Reduced opacity for non-current cards
      scale: isCurrent ? 1 : 0.75,
    }}
    animate={{
      x: isCurrent ? "0%" : isPrevious ? "-100%" : isNext ? "100%" : "0%",
      opacity: isCurrent ? 1 : 0.4, // Reduced opacity for non-current cards
      scale: isCurrent ? 1 : 0.75,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    drag="x"
    dragConstraints={{ left: -300, right: 300 }}
    onDragEnd={onDragEnd}
  >
    <img
      src={member.image}
      alt={member.name}
      className="w-full h-3/4 object-cover"
    />
    <div className="p-3 md:p-6 text-center">
      <h3 className="text-xl md:text-3xl font-bold mb-2 text-gray-800">
        {member.name}
      </h3>
      <p className="text-xs text-gray-600 md:text-base">
        {member.role}
      </p>
    </div>
  </motion.div>
);

export default CarouselCard;
