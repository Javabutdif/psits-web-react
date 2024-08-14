import React from 'react';
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import About from '../components/sections/home/About';
import CoreValues from '../components/sections/home/CoreValues';
import Goals from '../components/sections/home/Goals';
import MissionVision from '../components/sections/home/MissionVision';

const ucMissionVision = [
  {
    type: 'Mission',
    text: 'The University offers affordable and quality education responsive to the demands of local and international communities.'
  },
  {
    type: 'Vision',
    text: 'Democratize quality education. Be the visionary and industry leader. Give hope and transform lives.'
  }
];

const ccsMissionVision = [
  {
    type: 'Mission',
    text: 'We envision being the hub of quality, globally-competitive and socially-responsive information technology education.'
  },
  {
    type: 'Vision',
    text: `We commit to continuously:
            Offer relevant programs that mold well-rounded computing professionals;\nEngage in accreditation and quality standards;\nand Facilitate in building an IT-enabled nation.`
  }
];

const Home = () => {
  return (
    <>
      <Banner />
      <DeansMessage />
      <section className="bg-gradient-to-b md:bg-gradient-to-r h-auto p-10 from-[#002E48] from-50% to-[#074873] to-50%">
        <div className="container flex flex-col md:flex-row gap-8">

          {/* University Section */}
          <div className="flex-1 pb-6">
            {ucMissionVision.map((item, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-white text-lg font-bold mb-2">{item.type}</h3>
                <p className="text-white">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Organization Section */}
          <div className="flex-1 pt-6 md:pt-0 md:pl-10">
            {ccsMissionVision.map((item, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-white text-lg font-bold mb-2">{item.type}</h3>
                <p className="text-white">{item.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Goals />
      <CoreValues />
      <About />
    </>
  );
};

export default Home;
