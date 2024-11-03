import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import president from "../assets/Core Officers/4.jpg";
import viceInternal from "../assets/Core Officers/5.jpg";
import viceExternal from "../assets/Core Officers/3.png";
import secretary from "../assets/Core Officers/sec.jpg";
import auditor from "../assets/Core Officers/8.png";
import treasurer from "../assets/Core Officers/6.png";
import assistantTreasurer from "../assets/Core Officers/7.png";
import pio from "../assets/Core Officers/9.png";
import pro from "../assets/Core Officers/10.png";
import firstRep from "../assets/Core Officers/12.jpg";
import secondRep from "../assets/Core Officers/13.png";
import thirdRep from "../assets/Core Officers/14.png";
import fourthRep from "../assets/Core Officers/15.png";
import chiefVol from "../assets/Core Officers/11.png";
import Carousel from "../components/Carousel/Carousel";
import dennis from "../assets/Faculty/35.png";
import barral from "../assets/Faculty/34.png";
import jia from "../assets/Faculty/36.png";
import beans from "../assets/Development Team/29.png";
import driane from "../assets/Development Team/30.png";
import jims from "../assets/Development Team/28.png";
import marianne from "../assets/Development Team/31.png";

const faculty = [
  { name: "Dennis Durano", image: dennis, role: "Advisor" },
  { name: "Jia Nova Montecino", image: jia, role: "Advisor" },
];

const teamMembers = [
  {
    name: "Anton James Genabio",
    image: jims,
    role: "Lead / Backend Developer",
  },
  { name: "Vince Datanagan", image: beans, role: "Front End Developer" },
  { name: "Ralph Adriane Dilao", image: driane, role: "FullStack Developer" },
  { name: "Marianne Joy Ybrado Napisa", image: marianne, role: "Web Designer" },
];

const officersAndReps = [
  { role: "President", name: "Aubrey Leyros", image: president },
  {
    role: "Vice President Internal",
    name: "Marlou Tadlip",
    image: viceInternal,
  },
  {
    role: "Vice President External",
    name: "Clint Louie Tuyor",
    image: viceExternal,
  },
  { role: "Secretary", name: "Sainth Anneshka N. Cuico", image: secretary },
  { role: "Auditor", name: "Daisy Lyn Laygan", image: auditor },
  { role: "Treasurer", name: "Jeraiza Gacang", image: treasurer },
  {
    role: "Asst. Treasurer",
    name: "Stephanie Echavez",
    image: assistantTreasurer,
  },
  { role: "P.I.O", name: "Princess Villanueva", image: pio },
  { role: "P.R.O", name: "John Paul Costillas", image: pro },
  { role: "Chief Volunteer", name: "Arvin Albeos", image: chiefVol },
  { role: "1st Year Rep", name: "Lee Vincent Laurito", image: firstRep },
  { role: "2nd Year Rep", name: "Christ Hanzen Rallos", image: secondRep },
  { role: "3rd Year Rep", name: "Angela Postrero", image: thirdRep },
  { role: "4th Year Rep", name: "Shainnah Lhyn Taborada", image: fourthRep },
];

const Community = () => {
  const [activeTab, setActiveTab] = useState("Advisors");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
    setCarouselIndex(0);
  }, []);

  const handleCarouselIndexChange = useCallback((newIndex) => {
    setCarouselIndex(newIndex);
  }, []);

  const tabContent = {
    Advisors: (
      <Carousel
        members={faculty}
        isActive={activeTab === "Advisors"}
        onIndexChange={handleCarouselIndexChange}
        currentIndex={carouselIndex}
      />
    ),
    Officers: (
      <Carousel
        members={officersAndReps}
        isActive={activeTab === "Officers"}
        onIndexChange={handleCarouselIndexChange}
        currentIndex={carouselIndex}
      />
    ),
    Developers: (
      <Carousel
        members={teamMembers}
        isActive={activeTab === "Developers"}
        onIndexChange={handleCarouselIndexChange}
        currentIndex={carouselIndex}
      />
    ),
  };

  return (
    <div className="bg-gradient-to-b from-primary min-h-main-md relative overflow-hidden">
      <div className="text-center">
        <ul className="absolute z-30 pt-20 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4 text-white">
          {["Advisors", "Officers", "Developers"].map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer p-2 text-base sm:text-sm md:text-base transition-all duration-300 ease-in-out ${
                activeTab === tab ? "font-bold border-b-2 border-primary" : ""
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>

        <div className="relative -top-2/4 translate-y-2/4">
          <AnimatePresence>
            <motion.section
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tabContent[activeTab] || <div>No content available</div>}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Community;
