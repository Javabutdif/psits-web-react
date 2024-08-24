import React from 'react';

const ButtonsComponent = ({ children, style }) => {
  
  return (
    <div className={`flex flex-row items-center ${style} gap-2 md:gap-3`}>
      {children}
    </div>
  );
};

export default ButtonsComponent;
