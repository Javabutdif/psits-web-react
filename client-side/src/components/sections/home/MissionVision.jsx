import React from 'react';

const MissionVision = ({ mission, vision, imageSrc }) => {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <div>
          <img src={imageSrc} alt="Mission and Vision" className="w-full h-auto rounded-lg shadow-md" />
        </div>
        
        {/* Mission and Vision Section */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
            <p className="text-lg text-gray-700">{mission}</p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h2>
            <p className="text-lg text-gray-700">{vision}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MissionVision;
