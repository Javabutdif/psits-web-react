import React from 'react';
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import About from '../components/sections/home/About';
import CoreValues from '../components/sections/home/CoreValues';
import Goals from '../components/sections/home/Goals';
import MissionVision from '../components/sections/home/MissionVision';


// const ucMissionVision = [
//   {
//     type: 'Mission',
//     text: 'The University offers affordable and quality education responsive to the demands of local and international communities.'
//   },
//   {
//     type: 'Vision',
//     text: 'Democratize quality education. Be the visionary and industry leader. Give hope and transform lives.'
//   }
// ];

// const ccsMissionVision = [
//   {
//     type: 'Mission',
//     text: 'We envision being the hub of quality, globally-competitive and socially-responsive information technology education.'
//   },
//   {
//     type: 'Vision',
//     text: 'We commit to continuously:\nOffer relevant programs that mold well-rounded computing professionals;\nEngage in accreditation and quality standards;\nand Facilitate in building an IT-enabled nation.'
//   }
// ];



const Home = () => {
  return (
    <>
      <Banner />
      <DeansMessage />
      {/* <section>
        <MissionVision vision={ucMissionVision[0]}m/>
        <MissionVision />
      </section> */}
      <Goals />
      <CoreValues />
      <About />
    </>
  );
};

export default Home;
