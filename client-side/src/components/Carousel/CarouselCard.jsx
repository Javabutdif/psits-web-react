import React from "react";
import { motion } from "framer-motion";

const CarouselCard = ({ member, isCurrent, isNext, isPrevious, onDragEnd }) => (
  <motion.div
    key={member.name}
    whileHover={{ scale: isCurrent ? 1.2 : 0.9 }}
    className={`w-[200px] h-[300px] md:w-[300px] md:h-[400px] lg:w-[350px] lg:h-[450px] absolute bg-white rounded-3xl shadow-lg overflow-hidden ${
      isCurrent
        ? "z-10 scale-100"
        : isPrevious || isNext
        ? "z-5 scale-90"
        : "hidden"
    }`}
    initial={{
      x: isPrevious ? "-120%" : isNext ? "120%" : "0%",
      opacity: isCurrent ? 1 : 0.5,
      scale: isCurrent ? 1 : 0.85,
    }}
    animate={{
      x: isCurrent ? "0%" : isPrevious ? "-100%" : isNext ? "100%" : "0%",
      opacity: isCurrent ? 1 : 0.9,
      scale: isCurrent ? 1 : 0.85,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.5 },
      x: { duration: 0.5 },
      scale: { duration: 0.5 },
    }}
    drag="x"
    dragConstraints={{ left: -300, right: 300 }}
    onDragEnd={onDragEnd}
  >
    <img
      src={member.image}
      alt={member.name}
      className="w-full h-2/3 object-cover"
    />
    <div className="p-2 md:p-4 lg:p-6 text-center">
      <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 text-gray-800">
        {member.name}
      </h3>
      <p className="text-sm md:text-base lg:text-lg text-gray-600">
        {member.role}
      </p>
    </div>
  </motion.div>
);

export default CarouselCard;
