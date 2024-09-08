import React from "react";
import useCarousel from "./UseCarousel";
import CarouselCard from "./CarouselCard";

const Carousel = ({ members }) => {
  const { currentIndex, handleDragEnd } = useCarousel(members.length);

  return (
    <div className="w-full min-h-screen py-14 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl h-96 flex items-center justify-center">
        {members.map((member, index) => {
          const isCurrent = index === currentIndex;
          const isNext = index === (currentIndex + 1) % members.length;
          const isPrevious =
            index === (currentIndex - 1 + members.length) % members.length;

          return (
            <CarouselCard
              key={index}
              member={member}
              isCurrent={isCurrent}
              isNext={isNext}
              isPrevious={isPrevious}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
