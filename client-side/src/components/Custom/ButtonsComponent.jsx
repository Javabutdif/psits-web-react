import React from 'react';

const ButtonsComponent = ({ children, style }) => {
  return (
    <div
      className={`flex-1 flex flex-row items-center gap-2 md:gap-3`} // Apply additional styles passed as props
    >
      {children}
    </div>
  );
};

export default ButtonsComponent;
