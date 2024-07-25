import React, { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Section from '../components/common/Section';  // Adjust the path as needed
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import CoreBeliefs from '../components/sections/home/CoreBeliefs';
import About from '../components/sections/home/About';

function Home() {
  const sectionRef1 = useRef(null);
  const sectionRef2 = useRef(null);
  const sectionRef3 = useRef(null);
  const sectionRef4 = useRef(null);
  // const sectionRef4 = useRef(null);

  const { scrollYProgress } = useScroll();

  const inView1 = useInView(sectionRef1, { threshold: 0.25, once: false,    });
  const inView2 = useInView(sectionRef2, { threshold: 0.25, once: true, margin: "0px 0px -40% 0px"});
  const inView3 = useInView(sectionRef3, { threshold: 0.25, once: false });
  const inView4 = useInView(sectionRef4, { threshold: 0.25, once: false });
  // const inView4 = useInView(sectionRef3, { threshold: 0.25, once: false });
  

  useEffect(() => {
    console.log("InView2:", inView2);
    console.log("InView1:", inView1)
  })

  const sectionVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { duration: 0.5 } }, // Adjust transition duration
  };

  const pathD = useTransform(scrollYProgress, [0, 1], [
    "M0,60L26.7,52.5C53.3,45,107,30,160,20C213.3,10,267,5,320,5C373.3,5,427,10,480,27.5C533.3,45,587,75,640,92.5C693.3,110,747,115,800,115C853.3,115,907,110,960,102.5C1013.3,95,1067,85,1120,67.5C1173.3,50,1227,25,1280,30C1333.3,35,1387,70,1440,70C1493.3,70,1547,35,1600,35C1653.3,35,1707,70,1760,85C1813.3,100,1867,95,1920,77.5C1973.3,60,2027,30,2080,35C2133.3,40,2187,80,2240,85C2293.3,90,2347,60,2400,55C2453.3,50,2507,70,2560,70C2613.3,70,2667,50,2720,57.5C2773.3,65,2827,100,2880,112.5C2933.3,125,2987,115,3040,95C3093.3,75,3147,45,3200,40C3253.3,35,3307,55,3360,55C3413.3,55,3467,35,3520,30C3573.3,25,3627,35,3680,40C3733.3,45,3787,45,3813,45L3840,45L3840,150L3813.3,150C3786.7,150,3733,150,3680,150C3626.7,150,3573,150,3520,150C3466.7,150,3413,150,3360,150C3306.7,150,3253,150,3200,150C3146.7,150,3093,150,3040,150C2986.7,150,2933,150,2880,150C2826.7,150,2773,150,2720,150C2666.7,150,2613,150,2560,150C2506.7,150,2453,150,2400,150C2346.7,150,2293,150,2240,150C2186.7,150,2133,150,2080,150C2026.7,150,1973,150,1920,150C1866.7,150,1813,150,1760,150C1706.7,150,1653,150,1600,150C1546.7,150,1493,150,1440,150C1386.7,150,1333,150,1280,150C1226.7,150,1173,150,1120,150C1066.7,150,1013,150,960,150C906.7,150,853,150,800,150C746.7,150,693,150,640,150C586.7,150,533,150,480,150C426.7,150,373,150,320,150C266.7,150,213,150,160,150C106.7,150,53,150,27,150L0,150Z",
    "M0,30L26.7,30C53.3,30,107,30,160,45C213.3,60,267,90,320,102.5C373.3,115,427,110,480,92.5C533.3,75,587,45,640,42.5C693.3,40,747,65,800,80C853.3,95,907,100,960,100C1013.3,100,1067,95,1120,80C1173.3,65,1227,40,1280,27.5C1333.3,15,1387,15,1440,30C1493.3,45,1547,75,1600,90C1653.3,105,1707,105,1760,90C1813.3,75,1867,45,1920,47.5C1973.3,50,2027,85,2080,82.5C2133.3,80,2187,40,2240,20C2293.3,0,2347,0,2400,7.5C2453.3,15,2507,30,2560,30C2613.3,30,2667,15,2720,25C2773.3,35,2827,70,2880,87.5C2933.3,105,2987,105,3040,110C3093.3,115,3147,125,3200,127.5C3253.3,130,3307,125,3360,122.5C3413.3,120,3467,120,3520,117.5C3573.3,115,3627,110,3680,92.5C3733.3,75,3787,45,3813,30L3840,15L3840,150L3813.3,150C3786.7,150,3733,150,3680,150C3626.7,150,3573,150,3520,150C3466.7,150,3413,150,3360,150C3306.7,150,3253,150,3200,150C3146.7,150,3093,150,3040,150C2986.7,150,2933,150,2880,150C2826.7,150,2773,150,2720,150C2666.7,150,2613,150,2560,150C2506.7,150,2453,150,2400,150C2346.7,150,2293,150,2240,150C2186.7,150,2133,150,2080,150C2026.7,150,1973,150,1920,150C1866.7,150,1813,150,1760,150C1706.7,150,1653,150,1600,150C1546.7,150,1493,150,1440,150C1386.7,150,1333,150,1280,150C1226.7,150,1173,150,1120,150C1066.7,150,1013,150,960,150C906.7,150,853,150,800,150C746.7,150,693,150,640,150C586.7,150,533,150,480,150C426.7,150,373,150,320,150C266.7,150,213,150,160,150C106.7,150,53,150,27,150L0,150Z"
  ]);

  return (
    <>
      <div className="relative bg-primary">
        <div className="bg-banner bg-no-repeat bg-cover bg-center absolute h-full w-full z-10" />  
        <Section
          ref={sectionRef1}
          inView={inView1}
          transitionVariants={sectionVariants}
          parentStyle="z-20 bg-no-repeat bg-cover overflow-hidden relative  min-h-[80vh] flex justify-center items-center text-center md:text-start"
          childrenStyle="relative py-16 mx-w-[1020px]"
        >
          {inView1 && <Banner />}
        </Section>
        <svg className="absolute -bottom-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
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
        parentStyle="py-24 md:py-32"
        childrenStyle="px-2 "
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
      <Section
        ref={sectionRef4}
        inView={inView4}
        transitionVariants={sectionVariants}
        parentStyle=""
        childrenStyle=""
      >
        {inView4 && <About />}

      </Section>
    </>
  );
}

export default Home;
