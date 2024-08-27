import React from "react";
import { motion } from "framer-motion";

const ImageGallery = ({ imageUrl, setPreview, activeIndex }) => {
  // Define animation variants
  const variants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 300 }
    },
    tap: {
      scale: 0.95,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 300 }
    },
    active: {
      border: "3px solid #007BFF", // Active border style
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <div className="grid grid-cols-[3rem_3rem_3rem] grid-rows-[3rem] gap-2 lg:grid-cols-[4rem] lg:grid-rows-[4rem_4rem_4rem]">
      {imageUrl.map((img, index) => (
        <motion.div
          key={index}
          className={`relative w-full h-full flex items-center justify-center shadow-md border rounded-sm transition-transform ${
            activeIndex === index ? "border-blue-500" : "border-transparent"
          }`}
          whileHover="hover"
          whileTap="tap"
          whileFocus="active"
          variants={variants}
          onClick={() => setPreview(img)}
        >
          <motion.img
            src={img}
            alt={`image-${index}`}
            className="object-cover w-full h-full rounded-sm"
            layout
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGallery;
