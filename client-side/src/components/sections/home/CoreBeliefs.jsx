import React from 'react';
import { motion, useInView } from 'framer-motion';

const CoreBeliefs = () => {
  const SectionTitle = ({ title }) => (
    <motion.h2
      className="text-4xl font-semibold text-center mb-10 text-gray-900"
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {title}
    </motion.h2>
  );

  const Card = ({ title, content, primary }) => (
    <motion.div
      className={`p-6 border rounded-lg shadow-sm transition-transform transform hover:scale-105 ${primary ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'}`}
      whileHover={{ scale: 1.05 }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl md:text-2xl font-medium mb-4 text-gray-800">{title}</h3>
      <p className="text-base text-gray-700">{content}</p>
    </motion.div>
  );

  return (
    <div className="container py-12 px-4 mx-auto">
      <section className="mb-16 text-center">
        <SectionTitle title="University of Cebu" />
        <motion.div
          className="flex flex-col md:flex-row gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
            hidden: { opacity: 0 }
          }}
        >
          <Card
            title="Mission"
            content="The University offers affordable and quality education responsive to the demands of local and international communities."
            primary
          />
          <Card
            title="Vision"
            content="Democratize quality education. Be the visionary and industry leader. Give hope and transform lives."
          />
        </motion.div>
      </section>

      <section className="mb-16 text-center">
        <SectionTitle title="College of Computer Studies" />
        <motion.div
          className="flex flex-col md:flex-row gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
            hidden: { opacity: 0 }
          }}
        >
          <Card
            title="Mission"
            content="We envision being the hub of quality, globally-competitive, and socially-responsive information technology education."
            primary
          />
          <Card
            title="Vision"
            content="We commit to continuously: Offer relevant programs, engage in accreditation, and facilitate in building an IT-enabled nation."
          />
        </motion.div>
      </section>

      <section className="mb-16 text-center">
        <SectionTitle title="Goals" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
            hidden: { opacity: 0 }
          }}
        >
          <Card
            title="Goals"
            content="Promotes scholarly endeavors for moral, social, cultural, and environmental interests. Meets industry demands in technical, personal, and interpersonal skills. Conducts intellectual, technological, and significant research in computing. Optimizes the use of appropriate and advanced resources and services."
            primary
          />
        </motion.div>
      </section>

      <section className="mb-16 text-center">
        <SectionTitle title="Core Values" />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
            hidden: { opacity: 0 }
          }}
        >
          <Card
            title="Initiative (Inceptum)"
            content="Wit, Practicality, Ingenuity"
            primary
          />
          <Card
            title="Innovation (Innovatio)"
            content="Technology, Creativity, Novelty"
          />
          <Card
            title="Service (Muneris)"
            content="Industry, Loyalty, Courtesy"
          />
        </motion.div>
      </section>
    </div>
  );
}

export default CoreBeliefs;
