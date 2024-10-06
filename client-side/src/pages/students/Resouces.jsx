import React from "react";
import { motion } from "framer-motion";
import { getInformationData } from "../../authentication/Authentication";

const Resources = () => {
  const tutorials = {
    firstYear: [
      {
        course: "CC-INTCOM11 Introduction to Computing",
        link: "https://www.scribd.com/document/618644383/Introduction-to-Computing-1st-year-1st-semester",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcPLG2rwvp9oN1C4XB4bEikx1h4AJVX6QRxw&s",
      },
      {
        course: "CC-COMPROG11 Computer Programming 1",
        link: "https://www.w3schools.com/c/c_intro.php",
        image:
          "https://w0.peakpx.com/wallpaper/757/901/HD-wallpaper-c-sharp-black-logo-programming-language-grid-metal-background-c-sharp-artwork-creative-programming-language-signs-c-sharp-logo.jpg",
      },
      {
        course: "CC-COMPROG12 Computer Programming 2",
        link: "https://www.w3schools.com/java/java_intro.asp",
        image:
          "https://4kwallpapers.com/images/wallpapers/java-black-2560x2560-16069.png",
      },
      {
        course: "IT-WEBDEV11 Web Design & Development",
        link: "https://www.w3schools.com/whatis/",
        image:
          "https://c8.alamy.com/comp/2C2MXR8/web-development-blue-color-text-on-dark-digital-background-2C2MXR8.jpg",
      },
      {
        course: "CC-DISCRET12 Discrete Structures",
        link: "https://www.csd.uwo.ca/~abrandt5/teaching/DiscreteStructures/intro.html",
        image:
          "https://www.shutterstock.com/image-vector/modern-color-thin-line-concept-600nw-511337065.jpg",
      },
    ],
    secondYear: [
      {
        course: "CC-DIGILOG21 Digital Logic Design",
        link: "https://www.geeksforgeeks.org/digital-electronics-logic-design-tutorials/",
        image:
          "https://as1.ftcdn.net/v2/jpg/01/22/17/08/1000_F_122170865_Cwufk4kjroqCSmWHmoj2BC4Cf0DJgvki.jpg",
      },
      {
        course: "IT-OOPROG21 Object Oriented Programming",
        link: "https://www.w3schools.com/java/java_oop.asp",
        image:
          "https://i.pinimg.com/originals/6e/12/6a/6e126a9ace040280e45f8144cf0cb2c8.jpg",
      },
      {
        course: "IT-PLATECH22 Platform Technologies w/ Op. Sys.",
        link: "https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/",
        image:
          "https://w0.peakpx.com/wallpaper/408/520/HD-wallpaper-windows-10-dark-logo-windows-10-computer-dark-logo-black-thumbnail.jpg",
      },
      {
        course: "IT-SAD21 System Analysis & Design",
        link: "https://www.tutorialspoint.com/system_analysis_and_design/system_analysis_and_design_overview.htm",
        image:
          "https://c8.alamy.com/comp/2DCAAG7/analyst-working-with-business-analytics-and-data-management-system-on-computer-to-make-report-with-kpi-and-metrics-connected-to-database-corporate-st-2DCAAG7.jpg",
      },
      {
        course: "CC-APPSDEV22 Applications Dev't & Emerging Tech.",
        link: "https://www.geeksforgeeks.org/introduction-to-c-sharp-windows-forms-applications/",
        image:
          "https://c8.alamy.com/comp/2DC8EXR/asp-net-inscription-against-laptop-and-code-background-learn-dot-net-programming-language-computer-courses-training-2DC8EXR.jpg",
      },
      {
        course: "CC-DASTRUC22 Data Structures & Algorithms",
        link: "https://www.geeksforgeeks.org/data-structures/",
        image:
          "https://img.pikbest.com/ai/illus_our/20230427/8f6e83cf21979200459e5f74cf34c766.jpg!w700wp",
      },
      {
        course: "CC-DATACOM22 Data Communications",
        link: "https://www.cisco.com/c/m/en_sg/partners/cisco-networking-academy/index.html",
        image:
          "https://1000logos.net/wp-content/uploads/2016/11/cisco-symbol.jpg",
      },
    ],
    thirdYear: [
      {
        course: "IT-IMDBSYS31 Information Management (DB Sys.1)",
        link: "https://www.w3schools.com/sql/",
        image: "https://cdn-icons-png.flaticon.com/512/5968/5968306.png",
      },
      {
        course: "IT-IMDBSYS32 Information Management (DB Sys. 2)",
        link: "https://www.mysqltutorial.org/",
        image: "https://cdn-icons-png.flaticon.com/512/5968/5968306.png",
      },
      {
        course: "IT-NETWORK31 Computer Networks",
        link: "https://www.cisco.com/c/m/en_sg/partners/cisco-networking-academy/index.html",
        image:
          "https://1000logos.net/wp-content/uploads/2016/11/cisco-symbol.jpg",
      },
      {
        course: "IT-INFOSEC32 Information Assurance & Security",
        link: "https://picoctf.org",
        image:
          "https://media.istockphoto.com/id/1383553886/pt/vetorial/abstract-banner-cyber-security-in-3d-style-communication-technology-database-system.jpg?s=612x612&w=0&k=20&c=Z8QCU9l9StN9Yc45T4OcCJCr4dCqhq4YIAeCZKl_DIo=",
      },
      {
        course: "IT-TESTQUA31 Testing & Quality Assurance",
        link: "https://www.softwaretestinghelp.com/",
        image:
          "https://us.123rf.com/450wm/dizanna/dizanna2203/dizanna220301177/183888419-qa-quality-assurance-acronym-business-concept-background.jpg",
      },
      {
        course: "IT-SYSARCH32 System Integration & Architecture",
        link: "https://www.slideshare.net/slideshow/chapter-1-introduction-to-system-integration-and-architecturepdf/263057894",
        image:
          "https://png.pngtree.com/png-vector/20220521/ourmid/pngtree-icon-of-system-integration-a-minimalistic-blackandwhite-symbol-for-industry-40-templates-web-design-and-infographics-vector-png-image_46354724.jpg",
      },
      {
        course: "CC-HCI31 Human Computer Interaction",
        link: "https://www.simplilearn.com/what-is-human-computer-interaction-article#:~:text=Human-Computer%20Interaction%20is%20a,friendly%2C%20efficient%2C%20and%20enjoyable.",
        image:
          "https://www.ise.tu-darmstadt.de/media/ise/research_ise/research_topics/Human-Computer_Interaction_Logo2.jpg",
      },
      {
        course: "CC-TECHNO32 Technopreneurship",
        link: "https://www.entrepreneur.com/topic/technopreneurship",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrwC759-O-IBokwPKPW862gha-jDGZ3OMQ2g&s",
      },

      {
        course: "IT-INTPROG32 Integrative Prog'g & Technologies",
        link: "https://learn.microsoft.com/en-us/aspnet/mvc/overview/getting-started/introduction/getting-started",
        image:
          "https://cdn.dribbble.com/users/42044/screenshots/3005802/media/18e91928154957a9baf2fcefbbd94f81.jpg?resize=400x300&vertical=center",
      },
    ],
    fourthYear: [
      {
        course: "Hacker Rank",
        link: "https://www.hackerrank.com",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png",
      },
    ],
  };

  const user = getInformationData();
  const year = user.year[1].split("-")[1];

  const yearMap = {
    1: "firstYear",
    2: "secondYear",
    3: "thirdYear",
    4: "fourthYear",
  };

  const displayYear = yearMap[year] || "firstYear";

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800">
          {displayYear.replace(/([A-Z])/g, " $1").toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tutorials[displayYear].map((tutorial, index) => (
            <motion.div
              key={index}
              className="relative bg-cover bg-center bg-no-repeat rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{
                backgroundImage: `url(${tutorial.image})`,
                height: "200px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a
                href={tutorial.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-full w-full bg-black bg-opacity-50 hover:bg-opacity-60 rounded-lg text-center p-4 text-white"
              >
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
