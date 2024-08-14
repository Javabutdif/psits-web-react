import React from 'react';

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

  return (
    <section className="container bg-secondary mx-auto px-6 py-12 md:py-24">
      <div className="">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Goals</h2>
        <p className="text-sm mb-8 text-gray-700 mb-12">We aim to cultivate a teaching-learning environment that:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-8">
          {goals.map((goal, index) => (
            <li key={goal.id} className={`${index === 0 ? '' : index === 1 ? 'lg:row-start-2 lg:col-start-2' : index === 2 ? 'lg:row-start-1 lg:col-start-3' : index === 3 ? 'lg:row-start-2 lg:col-start-4' : ''} flex items-center text-sm text-gray-700 p-6 bg-white rounded-lg shadow-lg`}>
              {goal.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Goals;
