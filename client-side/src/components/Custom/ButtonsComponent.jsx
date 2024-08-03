import React from 'react';

const ButtonsComponent = ({ children }) => {
  
  return (
    <div className="flex flex-row items-center gap-2 md:gap-3 md:justify-end">
      {children}
    </div>
  );
};

export default ButtonsComponent;
