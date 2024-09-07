import React from 'react';
import { motion } from 'framer-motion';
import { getUser } from '../../authentication/Authentication';

const Resources = () => {
  const tutorials = {
    firstYear: [
      {
        course: "CC-INTCOM11 Introduction to Computing",
        link: "https://www.scribd.com/document/618644383/Introduction-to-Computing-1st-year-1st-semester",
        image: "https://via.placeholder.com/600x400?text=Intro+to+Computing"
      },
      {
        course: "CC-COMPROG11 Computer Programming 1",
        link: "https://www.w3schools.com/c/c_intro.php",
        image: "https://via.placeholder.com/600x400?text=Computer+Programming+1"
      },
      {
        course: "CC-COMPROG12 Computer Programming 2",
        link: "https://www.w3schools.com/java/java_intro.asp",
        image: "https://via.placeholder.com/600x400?text=Computer+Programming+2"
      },
      {
        course: "IT-WEBDEV11 Web Design & Development",
        link: "https://www.w3schools.com/whatis/",
        image: "https://via.placeholder.com/600x400?text=Web+Design+%26+Development"
      },
      {
        course: "CC-DISCRET12 Discrete Structures",
        link: "https://www.csd.uwo.ca/~abrandt5/teaching/DiscreteStructures/intro.html",
        image: "https://via.placeholder.com/600x400?text=Discrete+Structures"
      }
    ],
    secondYear: [
      {
        course: "CC-DIGILOG21 Digital Logic Design",
        link: "https://www.geeksforgeeks.org/digital-electronics-logic-design-tutorials/",
        image: "https://via.placeholder.com/600x400?text=Digital+Logic+Design"
      },
      {
        course: "IT-OOPROG21 Object Oriented Programming",
        link: "https://www.w3schools.com/java/java_oop.asp",
        image: "https://via.placeholder.com/600x400?text=Object+Oriented+Programming"
      },
      {
        course: "IT-PLATECH22 Platform Technologies w/ Op. Sys.",
        link: "https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/",
        image: "https://via.placeholder.com/600x400?text=Platform+Technologies"
      },
      {
        course: "IT-SAD21 System Analysis & Design",
        link: "https://www.tutorialspoint.com/system_analysis_and_design/system_analysis_and_design_overview.htm",
        image: "https://via.placeholder.com/600x400?text=System+Analysis+%26+Design"
      },
      {
        course: "CC-APPSDEV22 Applications Dev't & Emerging Tech.",
        link: "https://www.geeksforgeeks.org/introduction-to-c-sharp-windows-forms-applications/",
        image: "https://via.placeholder.com/600x400?text=Applications+Dev%27t"
      },
      {
        course: "CC-DASTRUC22 Data Structures & Algorithms",
        link: "https://www.geeksforgeeks.org/data-structures/",
        image: "https://via.placeholder.com/600x400?text=Data+Structures+%26+Algorithms"
      },
      {
        course: "CC-DATACOM22 Data Communications",
        link: "https://www.cisco.com/c/m/en_sg/partners/cisco-networking-academy/index.html",
        image: "https://via.placeholder.com/600x400?text=Data+Communications"
      }
    ],
    thirdYear: [
      {
        course: "IT-IMDBSYS31 Information Management (DB Sys.1)",
        link: "https://www.w3schools.com/sql/",
        image: "https://via.placeholder.com/600x400?text=Information+Management"
      },
      {
        course: "IT-IMDBSYS32 Information Management (DB Sys. 2)",
        link: "https://www.mysqltutorial.org/",
        image: "https://via.placeholder.com/600x400?text=Information+Management+2"
      },
      {
        course: "IT-NETWORK31 Computer Networks",
        link: "https://www.cisco.com/c/m/en_sg/partners/cisco-networking-academy/index.html",
        image: "https://via.placeholder.com/600x400?text=Computer+Networks"
      },
      {
        course: "IT-INFOSEC32 Information Assurance & Security",
        link: "https://www.cybrary.it/",
        image: "https://via.placeholder.com/600x400?text=Information+Assurance+%26+Security"
      },
      {
        course: "IT-TESTQUA31 Testing & Quality Assurance",
        link: "https://www.softwaretestinghelp.com/",
        image: "https://via.placeholder.com/600x400?text=Testing+%26+Quality+Assurance"
      },
      {
        course: "IT-SYSARCH32 System Integration & Architecture",
        link: "https://www.ibm.com/cloud/architecture",
        image: "https://via.placeholder.com/600x400?text=System+Integration+%26+Architecture"
      },
      {
        course: "CC-HCI31 Human Computer Interaction",
        link: "https://www.hcibib.org/",
        image: "https://via.placeholder.com/600x400?text=Human+Computer+Interaction"
      },
      {
        course: "CC-TECHNO32 Technopreneurship",
        link: "https://www.entrepreneur.com/topic/technopreneurship",
        image: "https://via.placeholder.com/600x400?text=Technopreneurship"
      },
      {
        course: "CC-RESCOM31 Methods of Research in Computing",
        link: "https://www.researchgate.net/",
        image: "https://via.placeholder.com/600x400?text=Methods+of+Research"
      },
      {
        course: "IT-INTPROG32 Integrative Prog'g & Technologies",
        link: "https://learn.microsoft.com/en-us/aspnet/mvc/overview/getting-started/introduction/getting-started",
        image: "https://via.placeholder.com/600x400?text=Integrative+Programming"
      },
    ]
  };

  // Retrieve the user's data and determine the year
  const [...course] = getUser();
  const year = course[1].split('-')[1];  // Assumes year is in the second position of the split array
  console.log(year)
  // Convert the year to match the keys in the tutorials object
  const yearMap = {
    1: 'firstYear',
    2: 'secondYear',
    3: 'thirdYear',
    4: 'fourthYear'
  };

  const displayYear = yearMap[year] || 'firstYear';  // Default to 'firstYear' if year is invalid

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800">{displayYear.replace(/([A-Z])/g, ' $1').toLowerCase()}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tutorials[displayYear].map((tutorial, index) => (
            <motion.div
              key={index}
              className="relative bg-cover bg-center bg-no-repeat rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ backgroundImage: `url(${tutorial.image})`, height: '200px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a href={tutorial.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-full w-full bg-black bg-opacity-50 hover:bg-opacity-60 rounded-lg text-center p-4 text-white">
                <div>
                  <h3 className="text-lg font-semibold">{tutorial.course}</h3>
                  <p className="text-sm">Click to visit</p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
