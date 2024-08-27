import React from 'react';
import { motion } from 'framer-motion';
import { getUser } from '../../authentication/Authentication';

const Resources = () => {
  const tutorials = {
    firstYear: [
      {
        course: "CC-INTCOM11 Introduction to Computing",
        link: "https://www.w3schools.com/whatis/whatis_intro.php",
        image: "https://www.w3schools.com/images/w3schools_logo_2.png"
      },
      {
        course: "CC-COMPROG11 Computer Programming 1",
        link: "https://www.learn-c.org/",
        image: "https://www.learn-c.org/images/c_logo.png"
      },
      {
        course: "CC-COMPROG12 Computer Programming 2",
        link: "https://www.learncpp.com/",
        image: "https://www.learncpp.com/wp-content/themes/learncpp/images/logo.png"
      },
      {
        course: "IT-WEBDEV11 Web Design & Development",
        link: "https://www.w3schools.com/html/",
        image: "https://www.w3schools.com/images/w3schools_logo_2.png"
      },
      {
        course: "CC-DISCRET12 Discrete Structures",
        link: "https://www.khanacademy.org/math/discrete-math",
        image: "https://www.khanacademy.org/images/khan-academy-logo.png"
      }
    ],
    secondYear: [
      {
        course: "CC-DIGILOG21 Digital Logic Design",
        link: "https://www.electronics-tutorials.ws/logic/logic_1.html",
        image: "https://www.electronics-tutorials.ws/images/logo.jpg"
      },
      {
        course: "CC-QUAMETH22 Quantitative Methods w/ Prob. Stat.",
        link: "https://www.khanacademy.org/math/statistics-probability",
        image: "https://www.khanacademy.org/images/khan-academy-logo.png"
      },
      {
        course: "IT-OOPROG21 Object Oriented Programming",
        link: "https://www.tutorialspoint.com/object_oriented_programming/index.htm",
        image: "https://www.tutorialspoint.com/images/tp_logo.png"
      },
      {
        course: "IT-PLATECH22 Platform Technologies w/ Op. Sys.",
        link: "https://www.geeksforgeeks.org/operating-systems/",
        image: "https://www.geeksforgeeks.org/wp-content/themes/geeksforgeeks/images/gfg_logo.png"
      },
      {
        course: "IT-SAD21 System Analysis & Design",
        link: "https://www.scribd.com/document/30422433/System-Analysis-and-Design",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Scribd_logo_2017.svg/1280px-Scribd_logo_2017.svg.png"
      },
      {
        course: "CC-APPSDEV22 Applications Dev't & Emerging Tech.",
        link: "https://www.udemy.com/topic/application-development/",
        image: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
      },
      {
        course: "CC-DASTRUC22 Data Structures & Algorithms",
        link: "https://www.geeksforgeeks.org/data-structures/",
        image: "https://www.geeksforgeeks.org/wp-content/themes/geeksforgeeks/images/gfg_logo.png"
      },
      {
        course: "CC-DATACOM22 Data Communications",
        link: "https://www.tutorialspoint.com/data_communication/index.htm",
        image: "https://www.tutorialspoint.com/images/tp_logo.png"
      }
    ],
    thirdYear: [
      {
        course: "IT-IMDBSYS31 Information Management (DB Sys.1)",
        link: "https://www.w3schools.com/sql/",
        image: "https://www.w3schools.com/images/w3schools_logo_2.png"
      },
      {
        course: "IT-IMDBSYS32 Information Management (DB Sys. 2)",
        link: "https://www.mysqltutorial.org/",
        image: "https://www.mysqltutorial.org/wp-content/themes/mysqltutorial/images/mysql-logo.png"
      },
      {
        course: "IT-NETWORK31 Computer Networks",
        link: "https://www.networkacademy.io/",
        image: "https://www.networkacademy.io/images/logo.png"
      },
      {
        course: "IT-INFOSEC32 Information Assurance & Security",
        link: "https://www.cybrary.it/",
        image: "https://www.cybrary.it/wp-content/themes/cybrary/images/logo.png"
      },
      {
        course: "IT-TESTQUA31 Testing & Quality Assurance",
        link: "https://www.softwaretestinghelp.com/",
        image: "https://www.softwaretestinghelp.com/wp-content/themes/sth/images/logo.png"
      },
      {
        course: "IT-SYSARCH32 System Integration & Architecture",
        link: "https://www.ibm.com/cloud/architecture",
        image: "https://www.ibm.com/cloud/images/architecture.svg"
      },
      {
        course: "CC-HCI31 Human Computer Interaction",
        link: "https://www.hcibib.org/",
        image: "https://www.hcibib.org/images/hci_logo.png"
      },
      {
        course: "CC-TECHNO32 Technopreneurship",
        link: "https://www.entrepreneur.com/topic/technopreneurship",
        image: "https://www.entrepreneur.com/images/logo.png"
      },
      {
        course: "CC-RESCOM31 Methods of Research in Computing",
        link: "https://www.researchgate.net/",
        image: "https://www.researchgate.net/favicon.ico"
      },
      {
        course: "IT-INTPROG32 Integrative Prog'g & Technologies",
        link: "https://www.oreilly.com/library/view/integrative-programming/9780135561614/",
        image: "https://media.oreilly.com/images/9780135561614.pdf"
      },
      {
        course: "IT-SYSADMN32 Systems Administration & Maintenance",
        link: "https://www.lynda.com/System-Administration-training-tutorials/231-0.html",
        image: "https://www.lynda.com/images/lynda-logo.png"
      },
      {
        course: "IT-CPSTONE30 Capstone Project 1",
        link: "https://www.edx.org/course/capstone-project-1",
        image: "https://www.edx.org/images/logo.png"
      },
      {
        course: "CC-PROFIS10 Professional Issues in Computing",
        link: "https://www.computingcareers.org/",
        image: "https://www.computingcareers.org/images/logo.png"
      }
    ],
    fourthYear: [
      {
        course: "IT-CPSTONE40 Capstone Project 2",
        link: "https://www.coursera.org/learn/capstone-project",
        image: "https://www.coursera.org/images/logo.png"
      },
      {
        course: "CC-PRACT40 Practicum",
        link: "https://www.linkedin.com/learning/",
        image: "https://www.linkedin.com/learning/images/logo.png"
      }
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
        <div className="flex flex-wrap gap-6">
          {tutorials[displayYear].map((tutorial, index) => (
            <motion.div
              key={index}
              className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full lg:w-1/2 lg:w-1/4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a href={tutorial.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 w-full">
                <img src={tutorial.image} alt={tutorial.course} className="w-16 h-16 object-cover rounded-full" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{tutorial.course}</h3>
                  <p className="text-sm text-gray-600">Click to visit</p>
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
