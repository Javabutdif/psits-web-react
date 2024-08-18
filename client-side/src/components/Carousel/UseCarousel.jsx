import { useState, useEffect } from 'react';

const useCarousel = (itemsCount) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % itemsCount);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + itemsCount) % itemsCount);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      goToPrevious();
    } else if (info.offset.x < -100) {
      goToNext();
    }
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 3000); // Change card every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [itemsCount]);

  return { currentIndex, handleDragEnd, goToNext, goToPrevious };
};

export default useCarousel;
