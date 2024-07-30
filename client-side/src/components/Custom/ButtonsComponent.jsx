import React from 'react';

const ButtonsComponent = ({ children }) => (
  <div className="flex flex-row items-center gap-4 md:gap-6 md:justify-end">
    {children}
  </div>
);

export default ButtonsComponent;