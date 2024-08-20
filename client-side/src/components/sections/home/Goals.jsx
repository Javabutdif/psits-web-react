import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Goals = () => {
  const goals = [
    {
      id: 1,
      description: "Promotes scholarly endeavors for the promotion of moral, social, cultural, and environmental interests."
    },
    {
      id: 2,
      description: "Meets the demands of the industry in terms of technical, personal and interpersonal skills."
    },
    {
      id: 3,
      description: "Conducts intellectual, technological and significant researches in computing."
    },
    {
      id: 4,
      description: "Optimizes the use of appropriate and advanced resources and services."
    }
  ];

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const springConfig = { damping: 10, stiffness: 100 };

  return (
    <section className="container mx-auto px-6 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Goals</h2>
        <p className="text-sm mb-4 text-gray-700">We aim to cultivate a teaching-learning environment that:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {goals.map((goal, index) => (
            <motion.li
              key={goal.id}
              className={`${index % 2 == 0 ? 'bg-primary' : 'bg-accent' } text-neutral-light flex items-center text-sm text-gray-700 p-6 rounded-lg shadow-lg ${index === 1 ? 'lg:row-start-2 lg:col-start-2' : index === 2 ? 'lg:row-start-1 lg:col-start-3' : index === 3 ? 'lg:row-start-2 lg:col-start-4' : ''}`}
              style={{ opacity, y: useSpring(y, springConfig) }}
              whileHover={{ scale: 1.05, boxShadow: '0px 8px 16px rgba(0,0,0,0.3)' }}
              transition={{ duration: 0.3 }}
            >
              {goal.description}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

export default Goals;
