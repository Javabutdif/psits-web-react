import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Banner from '../components/sections/home/Banner';
import DeansMessage from '../components/sections/home/DeansMessage';
import CoreBeliefs from '../components/sections/home/CoreBeliefs';

const Home = () => {
  const { scrollY } = useScroll();

  // Animation transforms
  const bannerY = useTransform(scrollY, [0, 600], [0, 600]); // Moves the banner down with scroll
  const bannerOpacity = useTransform(scrollY, [0, 300], [1, 0]); // Optional: fades out the banner

  return (
    <main className="relative">
      <motion.div
        className="z-10" // Sticky at top with a white background
        style={{ y: bannerY, opacity: bannerOpacity }}
        transition={{ duration: 0.5 }}
      >
        <Banner />
      </motion.div>
      <div className="bg-secondary">
        <section >
          <DeansMessage />
        </section>
          <CoreBeliefs />

      </div>
    </main>
  );
};

export default Home;
