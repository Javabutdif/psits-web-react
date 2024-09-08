import { useState, useEffect, useCallback } from "react";

const useCarousel = (totalItems, isActive, onIndexChange, currentIndex) => {
  const [localIndex, setLocalIndex] = useState(currentIndex);

  useEffect(() => {
    setLocalIndex(currentIndex);
  }, [currentIndex]);

  const handleDragEnd = useCallback((event, info) => {
    if (!isActive) return;

    const { offset, velocity } = info;
    const swipeThreshold = 100; // Swipe threshold for sensitivity
    const velocityThreshold = 0.2; // Velocity threshold to determine direction

    let direction = 0;

    if (Math.abs(velocity.x) > velocityThreshold) {
      direction = velocity.x > 0 ? -1 : 1; // Velocity determines direction
    } else if (Math.abs(offset.x) > swipeThreshold) {
      direction = offset.x > 0 ? -1 : 1; // Offset determines direction
    }

    if (direction !== 0) {
      let newIndex = (localIndex - direction + totalItems) % totalItems;
      if (newIndex < 0) newIndex += totalItems;

      setLocalIndex(newIndex);
      onIndexChange(newIndex);
    }
  }, [localIndex, totalItems, isActive, onIndexChange]);

  return { currentIndex: localIndex, handleDragEnd };
};

export default useCarousel;
