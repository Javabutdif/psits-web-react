import React from "react";
import { motion } from "framer-motion";

const CarouselCard = ({ member, position, isActive, onDragStart, onDragEnd }) => {
  return (
    <motion.div
      className="absolute bg-white rounded-xl shadow-lg overflow-hidden"
      style={{ width: "90%", maxWidth: "350px"}}
      initial={position}
      animate={position}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        duration: 0.5,
      }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-auto object-cover"
      />
      <div className="absolute inset-0 z-50 bg-black opacity-0 bg-opacity-50 text-white p-4 flex items-center justify-center">
        {/* Content over the image */}
      </div>
    </motion.div>
  );
};

export default CarouselCard;
