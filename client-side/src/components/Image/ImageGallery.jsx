import React from "react";
import { motion } from "framer-motion";

const ImageGallery = ({ imageUrl, setPreview }) => {
  return (
    <div className="flex flex-row lg:flex-col gap-2 mt-2 md:mt-0">
      {imageUrl.map((img, index) => (
        <motion.img
          src={img}
          key={index}
          alt={`${img}-${index}`}
          className="cursor-pointer w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg border transition-transform duration-200 hover:scale-105"
          onClick={() => setPreview(img)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          layout
        />
      ))}
    </div>
  );
};

export default ImageGallery;
