import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">🚧 Under Construction 🚧</h1>
        <p className="text-gray-700">We're working hard to bring something amazing to you. Please check back soon!</p>
      </div>
    </div>
  );
};

export default UnderConstruction;
