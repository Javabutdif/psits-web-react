import React from "react";
import { motion } from "framer-motion";

const ImagePreview = ({ preview }) => {
  return (
    <motion.div
      className="flex-1 flex justify-center items-center border rounded-xl overflow-hidden bg-gray-100 shadow-lg w-full h-64 sm:h-80 md:h-96"
      layout
    >
      {preview ? (
        <motion.img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover"
          key={preview}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        />
      ) : (
        <motion.div
          className="flex items-center justify-center w-full h-full text-gray-400 font-semibold"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <p>No image selected</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImagePreview;
