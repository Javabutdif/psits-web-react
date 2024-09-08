// Carousel.js
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import CarouselCard from "./CarouselCard";

const Carousel = ({ members, isActive, onIndexChange, currentIndex }) => {
  const [isDragging, setIsDragging] = useState(false);

  const cardWidth = 250;
  const cardSpacing = 10;

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (!isDragging) {
        const newIndex = (currentIndex + 1) % members.length;
        onIndexChange(newIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, isActive, members.length, onIndexChange, isDragging]);

  const calculatePosition = useCallback((index) => {
    const offset = index - currentIndex;
    const distance = offset * (cardWidth + cardSpacing);
    if (offset === 0) {
      return { x: distance, scale: 0.9, zIndex: 3 };
    } else if (Math.abs(offset) === 1) {
      return { x: offset * 250, scale: 0.8, zIndex: 2 };
    } else {
      return { x: offset * 200, scale: 0.7, zIndex: 1 };
    }
  }, [currentIndex]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    if (!isActive) return;

    const { offset, velocity } = info;
    const swipeThreshold = 50;

    if (offset.x > swipeThreshold || velocity.x > 0.3) {
      onIndexChange((currentIndex - 1 + members.length) % members.length);
    } else if (offset.x < -swipeThreshold || velocity.x < -0.3) {
      onIndexChange((currentIndex + 1) % members.length);
    }
  };

  return (
    <div className="relative w-full max-w-4xl h-96 ml-auto overflow-visible">
      {members.map((member, index) => {
        const position = calculatePosition(index);
        return (
          <CarouselCard
            key={index}
            member={member}
            position={position}
            isActive={isActive && index === currentIndex}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
};

export default Carousel;