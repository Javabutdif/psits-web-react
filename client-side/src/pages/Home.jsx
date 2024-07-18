import React, { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Section from '../components/common/Section';  // Adjust the path as needed
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import CoreBeliefs from '../components/sections/home/CoreBeliefs';

function Home() {
  const sectionRef1 = useRef(null);
  const sectionRef2 = useRef(null);
  const sectionRef3 = useRef(null);
  // const sectionRef4 = useRef(null);

  const { scrollYProgress } = useScroll();

  const inView1 = useInView(sectionRef1, { threshold: 0.25, once: false,    });
  const inView2 = useInView(sectionRef2, { threshold: 0.25, once: true, margin: "0px 0px -30% 0px"});
  const inView3 = useInView(sectionRef3, { threshold: 0.25, once: false });
  // const inView4 = useInView(sectionRef3, { threshold: 0.25, once: false });
  

  useEffect(() => {
    console.log("InView2:", inView2);
    console.log("InView1:", inView1)
  })

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }, // Adjust transition duration
  };

  const pathD = useTransform(scrollYProgress, [0, 1], [
    "M0,46L26.7,65.2C53.3,84,107,123,160,141.8C213.3,161,267,161,320,145.7C373.3,130,427,100,480,88.2C533.3,77,587,84,640,107.3C693.3,130,747,169,800,168.7C853.3,169,907,130,960,99.7C1013.3,69,1067,46,1120,49.8C1173.3,54,1227,84,1280,107.3C1333.3,130,1387,146,1440,141.8C1493.3,138,1547,115,1600,88.2C1653.3,61,1707,31,1760,30.7C1813.3,31,1867,61,1920,76.7C1973.3,92,2027,92,2080,76.7C2133.3,61,2187,31,2240,15.3C2293.3,0,2347,0,2400,30.7C2453.3,61,2507,123,2560,134.2C2613.3,146,2667,107,2720,111.2C2773.3,115,2827,161,2880,149.5C2933.3,138,2987,69,3040,42.2C3093.3,15,3147,31,3200,53.7C3253.3,77,3307,107,3360,122.7C3413.3,138,3467,138,3520,118.8C3573.3,100,3627,61,3680,53.7C3733.3,46,3787,69,3813,80.5L3840,92L3840,230L3813.3,230C3786.7,230,3733,230,3680,230C3626.7,230,3573,230,3520,230C3466.7,230,3413,230,3360,230C3306.7,230,3253,230,3200,230C3146.7,230,3093,230,3040,230C2986.7,230,2933,230,2880,230C2826.7,230,2773,230,2720,230C2666.7,230,2613,230,2560,230C2506.7,230,2453,230,2400,230C2346.7,230,2293,230,2240,230C2186.7,230,2133,230,2080,230C2026.7,230,1973,230,1920,230C1866.7,230,1813,230,1760,230C1706.7,230,1653,230,1600,230C1546.7,230,1493,230,1440,230C1386.7,230,1333,230,1280,230C1226.7,230,1173,230,1120,230C1066.7,230,1013,230,960,230C906.7,230,853,230,800,230C746.7,230,693,230,640,230C586.7,230,533,230,480,230C426.7,230,373,230,320,230C266.7,230,213,230,160,230C106.7,230,53,230,27,230L0,230Z",
    "M0,161L14.1,157.2C28.2,153,56,146,85,149.5C112.9,153,141,169,169,161C197.6,153,226,123,254,122.7C282.4,123,311,153,339,164.8C367.1,176,395,169,424,149.5C451.8,130,480,100,508,72.8C536.5,46,565,23,593,19.2C621.2,15,649,31,678,65.2C705.9,100,734,153,762,161C790.6,169,819,130,847,130.3C875.3,130,904,169,932,164.8C960,161,988,115,1016,107.3C1044.7,100,1073,130,1101,126.5C1129.4,123,1158,84,1186,76.7C1214.1,69,1242,92,1271,99.7C1298.8,107,1327,100,1355,103.5C1383.5,107,1412,123,1440,134.2C1468.2,146,1496,153,1525,153.3C1552.9,153,1581,146,1609,134.2C1637.6,123,1666,107,1694,103.5C1722.4,100,1751,107,1779,115C1807.1,123,1835,130,1864,122.7C1891.8,115,1920,92,1948,95.8C1976.5,100,2005,130,2019,145.7L2032.9,161L2032.9,230L2018.8,230C2004.7,230,1976,230,1948,230C1920,230,1892,230,1864,230C1835.3,230,1807,230,1779,230C1750.6,230,1722,230,1694,230C1665.9,230,1638,230,1609,230C1581.2,230,1553,230,1525,230C1496.5,230,1468,230,1440,230C1411.8,230,1384,230,1355,230C1327.1,230,1299,230,1271,230C1242.4,230,1214,230,1186,230C1157.6,230,1129,230,1101,230C1072.9,230,1045,230,1016,230C988.2,230,960,230,932,230C903.5,230,875,230,847,230C818.8,230,791,230,762,230C734.1,230,706,230,678,230C649.4,230,621,230,593,230C564.7,230,536,230,508,230C480,230,452,230,424,230C395.3,230,367,230,339,230C310.6,230,282,230,254,230C225.9,230,198,230,169,230C141.2,230,113,230,85,230C56.5,230,28,230,14,230L0,230Z"
  ]);

  return (
    <>
      <div className="relative bg-primary">
        <div className="bg-banner bg-no-repeat bg-cover bg-center absolute h-full w-full z-10" />  
        <Section
          ref={sectionRef1}
          inView={inView1}
          transitionVariants={sectionVariants}
          parentStyle="z-20 bg-no-repeat bg-cover overflow-hidden relative  min-h-[75vh] flex justify-center items-center text-center md:text-start"
          childrenStyle="relative py-16 container"
        >
          {inView1 && <Banner />}
        </Section>
        <svg className="absolute -bottom-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 180">
          <motion.path
            fill="#f2f2f2"
            fillOpacity="1"
            d={pathD}
          />
        </svg>
      </div>
      <Section
        ref={sectionRef2}
        inView={inView2}
        transitionVariants={sectionVariants}
        parentStyle="py-32 md:py-40"
        childrenStyle="px-2"
      >
        {inView2 && <DeansMessage />}
      </Section>
      <Section
        ref={sectionRef3}
        inView={inView3}
        transitionVariants={sectionVariants}
        parentStyle=""
        childrenStyle=""
      >
        {inView3 && <CoreBeliefs />}

      </Section>
    </>
  );
}

export default Home;
