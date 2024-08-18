import React from 'react';
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import About from '../components/sections/home/About';
import CoreValues from '../components/sections/home/CoreValues';
import Goals from '../components/sections/home/Goals';
import MissionVision from '../components/sections/home/MissionVision';


const Home = () => {
  return (
    <>
      <Banner />
      <DeansMessage />
      <MissionVision />
      <Goals />
      <CoreValues />
      <About />
    </>
  );
};

export default Home;
