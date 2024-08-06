import React from 'react';
import { motion } from 'framer-motion';
import ucLogo from '../../../assets/images/UC_logo 1.png';
import ccsLogo from '../../../assets/images/ccs.png';

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SectionTitle = ({ children }) => (
  <motion.h3 
    className="text-2xl font-bold text-center mb-8 text-gray-800"
    variants={childVariants}
  >
    {children}
  </motion.h3>
);

const Card = ({ title, content, isPrimary = false }) => (
  <motion.div 
    className={`p-6 rounded-lg shadow-lg ${isPrimary ? 'bg-primary text-white' : 'bg-white'}`}
    variants={childVariants}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <h4 className="text-lg font-semibold mb-3">{title}</h4>
    <p className="text-sm">{content}</p>
  </motion.div>
);

const CoreBeliefs = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section 
        className="mb-16"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <SectionTitle>University of Cebu</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Mission"
            content="The University offers affordable and quality education responsive to the demands of local and international communities."
            isPrimary
          />
          <Card
            title="Vision"
            content="Democratize quality education. Be the visionary and industry leader. Give hope and transform lives."
          />
        </div>
      </motion.section>

      <motion.section 
        className="mb-16"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <SectionTitle>College of Computer Studies</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Mission"
            content="We envision being the hub of quality, globally-competitive, and socially-responsive information technology education."
          />
          <Card
            title="Vision"
            content="We commit to continuously: Offer relevant programs, engage in accreditation, and facilitate in building an IT-enabled nation."
            isPrimary
          />
        </div>
      </motion.section>

      <motion.section 
        className="mb-16"
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <SectionTitle>Goals</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            "Promotes scholarly endeavors for moral, social, cultural, and environmental interests.",
            "Meets industry demands in technical, personal, and interpersonal skills.",
            "Conducts intellectual, technological, and significant research in computing.",
            "Optimizes the use of appropriate and advanced resources and services."
          ].map((goal, index) => (
            <Card
              key={index}
              content={goal}
              isPrimary={index % 2 === 0}
            />
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial="hidden"
        animate="visible"
        variants={parentVariants}
      >
        <SectionTitle>Core Values</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Initiative (Inceptum)"
            content="Wit, Practicality, Ingenuity"
          />
          <Card
            title="Innovation (Innovatio)"
            content="Technology, Creativity, Novelty"
            isPrimary
          />
          <Card
            title="Service (Muneris)"
            content="Industry, Loyalty, Courtesy"
          />
        </div>
      </motion.section>
    </div>
  );
};

export default CoreBeliefs;