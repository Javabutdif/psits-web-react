import akwe1 from "../assets/akwe/CCS 1 (4).jpg";
import akwe2 from "../assets/akwe/CCS 1 (5).jpg";
import akwe3 from "../assets/akwe/CCS 1 (6).jpg";
import akwe4 from "../assets/akwe/CCS 1 (7).jpg";
import akwe5 from "../assets/akwe/CCS 1 (11).jpg";
import akwe6 from "../assets/akwe/CCS 1 (12).jpg";
import akwe7 from "../assets/akwe/CCS 1 (13).jpg";
import akwe8 from "../assets/akwe/CCS 1 (14).jpg";
import akwe9 from "../assets/akwe/CCS 1 (15).jpg";
import akwe10 from "../assets/akwe/CCS 1 (17).jpg";
import akwe11 from "../assets/akwe/CCS 1 (35).jpg";
import akwe12 from "../assets/akwe/CCS 2 (9).jpg";
import akwe13 from "../assets/akwe/CCS 2 (22).jpg";
import akwe14 from "../assets/akwe/CCS 3 (2).jpg";
import akwe15 from "../assets/akwe/CCS 3 (3).jpg";
import akwe16 from "../assets/akwe/CCS 3 (23).jpg";
import akwe17 from "../assets/akwe/CCS 4 (9).jpg";
import akwe18 from "../assets/akwe/CCS 4 (10).jpg";
import akwe19 from "../assets/akwe/CCS 4 (12).jpg";
import akwe20 from "../assets/akwe/CCS 4 (25).jpg";
import akwe21 from "../assets/akwe/CCS 4 (26).jpg";
import akwe22 from "../assets/akwe/CCS 4 (28).jpg";
import Banner from "../components/sections/events/Banner";
import { motion, useAnimation } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

export const akweImageArray = [
  akwe9,
  akwe2,
  akwe3,
  akwe4,
  akwe5,
  akwe6,
  akwe7,
  akwe8,
  akwe1,
  akwe10,
  akwe11,
  akwe12,
  akwe13,
  akwe14,
  akwe15,
  akwe16,
  akwe17,
  akwe18,
  akwe19,
  akwe20,
  akwe21,
  akwe22,
];
export const intramsImageArray = [
  "/intramurals/1.jpg",
  "/intramurals/2.jpg",
  "/intramurals/3.jpg",
  "/intramurals/4.jpg",
  "/intramurals/5.jpg",
  "/intramurals/6.jpg",
  "/intramurals/7.jpg",
  "/intramurals/8.jpg",
  "/intramurals/9.jpg",
  "/intramurals/10.jpg",
  "/intramurals/11.jpg",
  "/intramurals/12.jpg",
  "/intramurals/13.jpg",
  "/intramurals/14.jpg",
  "/intramurals/15.jpg",
  "/intramurals/16.jpg",
  "/intramurals/17.jpg",
  "/intramurals/18.jpg",
  "/intramurals/19.jpg",
  "/intramurals/20.jpg",
];
const nihonggoImageArray = [
  "/nihonggo/1.jpg",
  "/nihonggo/2.jpg",
  "/nihonggo/3.jpg",
  "/nihonggo/4.jpg",
  "/nihonggo/5.jpg",
  "/nihonggo/6.jpg",
  "/nihonggo/7.jpg",
  "/nihonggo/8.jpg",
  "/nihonggo/9.jpg",
  "/nihonggo/10.jpg",
  "/nihonggo/11.jpg",
  "/nihonggo/12.jpg",
  "/nihonggo/13.jpg",
  "/nihonggo/14.jpg",
  "/nihonggo/15.jpg",
  "/nihonggo/16.jpg",
  "/nihonggo/17.jpg",
  "/nihonggo/18.jpg",
  "/nihonggo/19.jpg",
  "/nihonggo/20.jpg",
  "/nihonggo/21.jpg",
  "/nihonggo/22.jpg",
  "/nihonggo/23.jpg",
  "/nihonggo/24.jpg",
  "/nihonggo/25.jpg",
  "/nihonggo/26.jpg",
];

const cbcImageArray = [
  "/cbc/1.jpg",
  "/cbc/2.jpg",
  "/cbc/3.jpg",
  "/cbc/4.jpg",
  "/cbc/5.jpg",
  "/cbc/6.jpg",
  "/cbc/7.jpg",
  "/cbc/8.jpg",
  "/cbc/9.jpg",
  "/cbc/10.jpg",
  "/cbc/11.jpg",
  "/cbc/12.jpg",
  "/cbc/13.jpg",
  "/cbc/14.jpg",
  "/cbc/15.jpg",
  "/cbc/16.jpg",
  "/cbc/17.jpg",
  "/cbc/18.jpg",
  "/cbc/19.jpg",
  "/cbc/20.jpg",
  "/cbc/21.jpg",
  "/cbc/22.jpg",
  "/cbc/23.jpg",
  "/cbc/24.jpg",
  "/cbc/25.jpg",
  "/cbc/26.jpg",
  "/cbc/27.jpg",
  "/cbc/28.jpg",
];

export const Carousel = ({ imageArray }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const intervalRef = useRef(null);

  useEffect(() => {
    startAutoplay();

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, []);

  useEffect(() => {
    controls.start({ opacity: 1 });
  }, [currentIndex]);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) {
      goToNext();
    } else if (info.offset.x > 100) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const getPreviousIndex = () =>
    currentIndex === 0 ? imageArray.length - 1 : currentIndex - 1;
  const getNextIndex = () =>
    currentIndex === imageArray.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="my-auto relative w-full max-w-full mx-auto pt-4 ">
      <div className="flex items-center justify-center space-x-4 pb-10">
        <motion.div
          className="w-1/3"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={imageArray[getPreviousIndex()]}
            alt="Previous"
            className="w-full h-auto object-cover"
          />
        </motion.div>

        <motion.div
          className="min-w-full"
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          <img
            src={imageArray[currentIndex]}
            alt="Current"
            className="w-full h-auto object-cover"
          />
        </motion.div>

        <motion.div
          className="w-1/3"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={imageArray[getNextIndex()]}
            alt="Next"
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center space-x-2 pb-4">
        {imageArray.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-primary" : "bg-gray-400"
            } transition-colors duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

export const Video = ({ src }) => {
  return (
    <>
      <div className="flex justify-center items-center mt-10 mb-10 min-w-full">
        <video
          src={src}
          controls
          autoPlay
          loop
          muted
          className="w-full max-w-6xl rounded-lg shadow-lg object-cover"
          loading="lazy"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  );
};

export const AkweMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className="z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          Thank You for Joining the CCS Acquaintance Party: A Night of Elegance
        </h2>
        <p className="text-base md:text-lg mb-4">
          On November 16, 2024, the CCS Acquaintance Party brought together
          students, faculty, and alumni at SM Seaside City Cebu for a night
          inspired by the timeless allure of the Old Money theme.
        </p>
        {showMore && (
          <>
            <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 text-base md:text-lg">
              <li>
                <strong>Sophisticated Entertainment: </strong> Live music and
                refined performances.
              </li>
              <li>
                <strong>Classic Activities:</strong> Fun games and experiences
                reflecting the old-money charm.
              </li>
              <li>
                <strong>Themed Photo Opportunities:</strong> Stunning moments
                captured in elegant settings.
              </li>
              <li>
                <strong>Networking in Style:</strong> Connections made in a
                luxurious atmosphere.
              </li>
            </ul>
            <p className="text-base md:text-lg">
              We extend our heartfelt gratitude to everyone who attended and
              made this event truly memorable. Until the next celebration!
            </p>
          </>
        )}
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
      </div>
      <Carousel imageArray={akweImageArray} />
    </>
  );
};

const IntramsMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          𝑨𝒏 𝑬𝒗𝒆𝒏𝒕 𝑳𝒊𝒌𝒆 𝑵𝒐 𝑶𝒕𝒉𝒆𝒓; 60𝒕𝒉 𝒀𝒆𝒂𝒓 𝒐𝒇 𝑼𝑪 𝑰𝒏𝒕𝒓𝒂𝒎𝒖𝒓𝒂𝒍𝒔
        </h2>
        <div className="text-base md:text-lg mb-4">
          <p>
            One of the most awaited events of every UCian is the 𝐚𝐧𝐧𝐮𝐚𝐥
            𝐜𝐞𝐥𝐞𝐛𝐫𝐚𝐭𝐢𝐨𝐧 𝐨𝐟 𝐈𝐧𝐭𝐫𝐚𝐦𝐮𝐫𝐚𝐥𝐬, and this year is no other. An event
            where all college departments battle each other to stand above the
            rest; an event that allows UCians to showcase their talents and
            skills; an
          </p>
          {showMore && (
            <>
              <p>
                event that unites all UCians from every campus; an event that
                shows the spirit and enthusiasm of every UCians; an event like
                no other, that is the true essence of UC Intramurals.
              </p>
              <br />
              <p>
                This year marks the 60th anniversary, thus the event has been
                made grandeur and bigger thanks to our amazing organizers and
                staff. Along with the opening of the Intramurals, the
                most-awaited 𝓑𝓻𝓮𝓪𝓴𝓸𝓾𝓽 𝓒𝓸𝓷𝓬𝓮𝓻𝓽 is back at it once again with more
                amazing performances full of 𝐡𝐲𝐩𝐞, 𝐬𝐰𝐚𝐠, 𝐚𝐧𝐝 𝐠𝐫𝐨𝐨𝐯𝐞. The talents
                of the 𝑼𝑪 𝑻𝒉𝒆𝒂𝒕𝒓𝒆 are also seen with their tear-jerking and
                relatable song lists. As a tribute, we present this video
                showcasing the highlights of the Intramurals 2024 opening
                ceremony on 𝐍𝐨𝐯𝐞𝐦𝐛𝐞𝐫 20, 2024. 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐟𝐮𝐧 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠!
              </p>
            </>
          )}
        </div>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
        <p className="text-base md:text-lg flex flex-col pt-4">
          <span> Video | Carl David L Binghay</span>
          <span>Editor | Carl David L Binghay </span>
          <span>Captions | Arvin Albeos</span>
          <span>#UCIntramurals2024</span>
        </p>
      </div>
      <Carousel imageArray={intramsImageArray} />
     
    </>
  );
};

const SeminarMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          "𝗨𝗖 𝗖𝗖𝗦 𝗖𝗮𝗿𝗲𝗲𝗿 𝗮𝗻𝗱 𝗜𝗻𝘁𝗲𝗿𝗻𝘀𝗵𝗶𝗽 𝟮𝟬𝟮𝟰"
        </h2>
        <div className="text-base md:text-lg mb-4">
          <p className="text-base md:text-lg mb-4">
            One of the most awaited events of every UCian is the 𝐚𝐧𝐧𝐮𝐚𝐥 The UC
            CCS community hosted its first-ever "𝗨𝗖 𝗖𝗖𝗦 𝗖𝗮𝗿𝗲𝗲𝗿 𝗮𝗻𝗱 𝗜𝗻𝘁𝗲𝗿𝗻𝘀𝗵𝗶𝗽
            𝟮𝟬𝟮𝟰" seminar for CCS students from different UC campuses who are
            graduating or starting their on-the-job training (OJT) next
            semester.
          </p>
          {showMore && (
            <>
              <p>
                The seminar offered a platform for students to network with
                potential employers, gain valuable insights into industry
                trends, and understand the skills needed to succeed in their
                chosen fields. As the seminar went on, students explored the
                company booths outside the venue to learn more about the
                company. Many applied by submitting their curriculum vitae and
                letters of intent to the companies they were interested in. We
                extend our special thanks to the following companies and their
                speakers for their contributions, which made a significant
                impact on our students' readiness for the workforce. Their
                presence and insights were invaluable to us.
              </p>
              <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 text-base md:text-lg">
                <li>
                  <strong>Accenture</strong>
                </li>
                <li>
                  <strong>Alliance Software Inc.</strong>
                </li>
                <li>
                  <strong>Talleco</strong>
                </li>
                <li>
                  <strong>Full Scale</strong>
                </li>
                <li>
                  <strong>FPT Software Philippines Corporation</strong>
                </li>
                <li>
                  <strong>Rococo Global Technologies Corporation </strong>
                </li>

                <li>
                  <strong>Lexmark</strong>
                </li>
                <li>
                  <strong>MYT SoftDev Solutions, Inc </strong>
                </li>
                <li>
                  <strong>Virginia Food, Inc.</strong>
                </li>
                <li>
                  <strong>Skanlog </strong>
                </li>
                <li>
                  <strong>Apteum Corp</strong>
                </li>
                <li>
                  <strong>ResponsivCode Technology Solutions</strong>
                </li>
                <li>
                  <strong>Exodia Game Development Outsourcing Corp. </strong>
                </li>
                <li>
                  <strong>Concentrix</strong>
                </li>
                <li>
                  <strong>TechMahindra</strong>
                </li>
              </ul>
            </>
          )}
        </div>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
        <p className="pt-4 text-base md:text-lg flex flex-col ">
          <span>
            {" "}
            Videographers | Carl David L Binghay , John Paul Costillas, & Diana
            Maxine Cenero{" "}
          </span>
          <span>Editor | Carl David L Binghay </span>
          <span>Captions | Shainnah Lhyn Taborada</span>
        </p>
      </div>

   
    </>
  );
};

const EmbededMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          𝗘𝗠𝗕𝗘𝗗𝗗𝗘𝗗 𝗦𝗬𝗦𝗧𝗘𝗠𝗦 𝗔𝗡𝗗 𝗜𝗼𝗧 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗘𝗫𝗛𝗜𝗕𝗜𝗧
        </h2>
        <p className="text-base md:text-lg mb-4">
          <p>
            {" "}
            Intelligent Connections: Building a Smarter World with IoT and
            Embedded Systems The College of Computer Studies hosted an
            impressive exhibit for the Embedded Systems and IoT Project,
            organized by CCS faculty member 𝗘𝗻𝗴𝗿. 𝗝𝗲𝗳𝗳 𝗦𝗮𝗹𝗶𝗺𝗯𝗮𝗻𝗴𝗼𝗻.
          </p>
          <br />
          {showMore && (
            <>
              <p>
                The event featured a diverse group of guest speakers and a panel
                of judges, who offered valuable feedback and constructive
                suggestions to enhance each project's capabilities. Students of
                the course IT-ELEMSYS showcased a wide range of innovative
                projects that aim to improve everyday life through technology.
                From smart home solutions to soil monitoring systems, the
                projects highlighted the potential of embedded systems and the
                Internet of Things (IoT) to create intelligent connections.
                Attendees had the opportunity to interact with the projects, ask
                questions, and engage in discussions with the student
                developers.
              </p>
              <br />
              <p>
                The event created a collaborative atmosphere, encouraging the
                exchange of ideas and fostering creativity among participants.
                The exhibit served as an excellent platform for students to
                demonstrate their skills, receive recognition for their hard
                work, and contribute to a smarter, more connected world. Here is
                the SDE Video that was presented upon the closing of the
                exhibit.
              </p>
            </>
          )}
        </p>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
      </div>

  
    </>
  );
};

const NihonggoMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          Nihonggo Culminating
        </h2>
        <p className="text-base md:text-lg mb-4">
          <p>
            {" "}
            December 17 was a momentous occasion as we came together to
            celebrate our Nihongo culminating event, a highlight of our
            collective journey in mastering the Japanese language and embracing
            its rich culture. This event was far more than an academic
            exercise—it was a vibrant expression of our growth, creativity, and
            shared passion for learning, culminating in a heartfelt celebration
            of Japanese traditions and values.
          </p>
          <br />
          {showMore && (
            <>
              <p>
                The day was filled with powerful performances that transported
                us to Japan through song, bringing to life iconic and
                traditional melodies that are beloved worldwide. The music
                created a deep connection between us and the culture we’ve come
                to admire, reminding us of how songs have the ability to unite
                people through shared experiences and emotions.
              </p>
              <br />
              <p>
                More than just an academic milestone, it was a celebration of
                the connections we’ve fostered, the skills we’ve honed, and the
                cultural bridges we’ve built.
              </p>
            </>
          )}
        </p>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
        <p className="pt-4 text-base md:text-lg flex flex-col ">
          <span>Caption | Jexie Ashley Capuno</span>
        </p>
      </div>

      <Carousel imageArray={nihonggoImageArray} />
    </>
  );
};

const YearEnd = () => {
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          2024 𝙨𝙚𝙖𝙨𝙤𝙣 𝙘𝙤𝙢𝙚𝙨 𝙩𝙤 𝙖𝙣 𝙚𝙣𝙙🥂
        </h2>
      </div>

   
    </>
  );
};

const CbcMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          𝑼𝑪 𝑰𝑻 𝑺𝒕𝒖𝒅𝒆𝒏𝒕𝒔, 𝑴𝒂𝒌𝒊𝒏𝒈 𝑾𝒂𝒗𝒆𝒔 𝒊𝒏 𝑪𝒆𝒏𝒕𝒓𝒂𝒍 𝑽𝒊𝒔𝒂𝒚𝒂𝒔’ 𝑻𝒆𝒄𝒉 𝑯𝒖𝒃!
        </h2>
        <p className="text-base md:text-lg mb-4">
          <p>
            {" "}
            The 𝐏𝐒𝐈𝐓𝐒 𝐎𝐫𝐠𝐚𝐧𝐢𝐳𝐚𝐭𝐢𝐨𝐧 of the University of Cebu - Main Campus
            recently announced its 𝐩𝐚𝐫𝐭𝐧𝐞𝐫𝐬𝐡𝐢𝐩 with the 𝐂𝐞𝐛𝐮 𝐁𝐥𝐨𝐜𝐤𝐜𝐡𝐚𝐢𝐧
            𝐂𝐨𝐧𝐟𝐞𝐫𝐞𝐧𝐜𝐞 2025. Students were invited to join and many registered.
            The recently concluded conference (𝐉𝐚𝐧 17 & 18), was held at the 𝐈𝐄𝐂
            𝐂𝐨𝐧𝐯𝐞𝐧𝐭𝐢𝐨𝐧 𝐂𝐞𝐧𝐭𝐞𝐫. In the conference, various stalls and booths from
            different start-ups, companies, and businesses were present.
            Students from other universities and even freelancers and already
            working professionals.
          </p>
          <br />
          {showMore && (
            <>
              <p>
                The event presented opportunities for the CCS Students of UC -
                Main in the form of networking, making connections, additional
                knowledge and information especially on the topics of
                blockchain, AI, Web3, and a lot more. The said event was also
                the first big blockchain conference ever held in Cebu, as
                various speakers who are experts in the said topics flew from
                afar just to be able to share their expertise. Some of our
                students were able to win some prizes and merch from the said
                event. Overall, the experience truly was exhilarating and
                enjoyable and provided the students with a possible path for
                their future in the field of technology.
              </p>
            </>
          )}
        </p>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
        <p className="pt-4 text-base md:text-lg flex flex-col ">
          <span>Caption | Arvin Albeos</span>
        </p>
      </div>

      <Carousel imageArray={cbcImageArray} />
    </>
  );
};

const Awarding = () => {
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          𝗥𝗲𝗹𝗶𝘃𝗲 𝘁𝗵𝗲 𝗲𝘅𝗰𝗶𝘁𝗲𝗺𝗲𝗻𝘁 𝗼𝗳 𝗖𝗖𝗦 𝗗𝗔𝗬𝗦 2025! 🎥
        </h2>
        <p className="text-base md:text-lg mb-4">
          <p>
            {" "}
            From thrilling competitions to impressive showcases of knowledge and
            wits, new and experienced contenders—brought their skills to the
            test, embodying the theme "𝐂𝐨𝐝𝐞. 𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐞. 𝐄𝐥𝐞𝐯𝐚𝐭𝐞. - 𝐒𝐡𝐚𝐩𝐢𝐧𝐠 𝐭𝐡𝐞
            𝐅𝐮𝐭𝐮𝐫𝐞 𝐰𝐢𝐭𝐡 𝐓𝐞𝐜𝐡𝐧𝐨𝐥𝐨𝐠𝐲". Watch these video highlights from Day 1 to
            Day 3 of our event!
          </p>
          <br />
        </p>

        <p className="pt-4 text-base md:text-lg flex flex-col ">
          <span> Video | Carl David Lim Binghay</span>
          <span>Captions | Christine Anne Alesna</span>
        </p>
      </div>

   
    </>
  );
};

export const IctMessage = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return (
    <>
      <div className=" z-20 -mt-24 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
          style={{ top: "5%", right: "5%" }}
        ></div>
        <div
          className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
          style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
          style={{ top: "60%", left: "80%" }}
        ></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          11TH ICT CONGRESS 2025
        </h2>
        <p className="text-base md:text-lg mb-4">
          <p> Fueling the future with passion and innovation!</p>
          <br />
          <p>
            At the 11th ICT Congress 2025, UC CCS students took over SM
            Seaside’s Sky Hall with pure energy, coding battles, groundbreaking
            ideas, and next-level TechTalks. The day was packed with powerful
            discussions on AI, cybersecurity, digital transformation, and the
            responsible use of technology. Every talk sparked new ideas, every
            session opened new possibilities, and every conversation fueled the
            drive to dream bigger.
          </p>
          <br />
          {showMore && (
            <>
              <p>
                But it didn’t stop at listening and learning. Students took
                center stage in a series of intense competitions, battling it
                out in C Programming, Java Programming, IT Quizzes, UI/UX
                Design, Networking, Hackathons, and Lightning Pitches. Each
                event showcased the hard work, passion, and talent that define
                UC’s future tech leaders.
              </p>
              <br />
              <p>
                The energy at Sky Hall was electric, a perfect mix of curiosity,
                ambition, and collaboration. It was a space where skills were
                sharpened, friendships were built, and visions for a better
                digital world were born.
              </p>
              <br />
              <p>
                This year’s ICT Congress proved one thing, when passion and
                innovation come together, there are no limits. The next
                generation of tech innovators isn’t just preparing for the
                future; they’re already creating it.
              </p>
              <br />
            </>
          )}
        </p>
        <button
          onClick={toggleShowMore}
          className="mt-2 text-white underline focus:outline-none"
        >
          {showMore ? "See less" : "See more"}
        </button>
        <p className="pt-4 text-base md:text-lg flex flex-col ">
          <span>Edited By | Carl David L. Binghay</span>
        </p>
      </div>

   
    </>
  );
};

const Events = () => {
  return (
    <>
      <Banner />
      <section className="px-4 min-h-screen container py-14 flex flex-col md:py-24 items-center justify-center space-y-5">
        <AkweMessage />
        <IntramsMessage />
        <SeminarMessage />
        <EmbededMessage />
        <NihonggoMessage />
        <YearEnd />
        <CbcMessage />
        <Awarding />
        <IctMessage />
      </section>
    </>
  );
};

export default Events;
