import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import president from "../assets/Core Officers/2.png";
import viceInternal from "../assets/Core Officers/4.png";
import viceExternal from "../assets/Core Officers/3.png";
import secretary from "../assets/Core Officers/5.png";
import auditor from "../assets/Core Officers/8.png";
import treasurer from "../assets/Core Officers/6.png";
import assistantTreasurer from "../assets/Core Officers/7.png";
import pio from "../assets/Core Officers/9.png";
import pro from "../assets/Core Officers/10.png";
import firstRep from "../assets/Core Officers/12.png";
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
  { name: "Christian Barral", image: barral, role: "Advisor" },
  { name: "Jia Nova Montecino", image: jia, role: "Advisor" },
];

const teamMembers = [
  { name: "Anton James Genabio", image: jims, role: "Lead / Backend Developer" },
  { name: "Vince Datanagan", image: beans, role: "Front End Developer" },
  { name: "Ralph Adriane Dilao", image: driane, role: "FullStack Developer" },
  { name: "Marianne Joy Ybrado Napisa", image: marianne, role: "Web Designer" },
];

const officersAndReps = [
  { role: "President", name: "Vince Andrew Santoya", image: president },
  { role: "Vice President Internal", name: "Aubrey Leyros", image: viceInternal },
  { role: "Vice President External", name: "Clint Louie Tuyor", image: viceExternal },
  { role: "Secretary", name: "Marlou Tadlip", image: secretary },
  { role: "Auditor", name: "Daisy Lyn Laygan", image: auditor },
  { role: "Treasurer", name: "Jeraiza Gacang", image: treasurer },
  { role: "Asst. Treasurer", name: "Stephanie Echavez", image: assistantTreasurer },
  { role: "P.I.O", name: "Princess Villanueva", image: pio },
  { role: "P.R.O", name: "John Paul Costillas", image: pro },
  { role: "Chief Volunteer", name: "Arvin Albeos", image: chiefVol },
  { role: "1st Year Rep", name: "Sainth Anneshka N. Cuico", image: firstRep },
  { role: "2nd Year Rep", name: "Christ Hanzen Rallos", image: secondRep },
  { role: "3rd Year Rep", name: "Angela Postrero", image: thirdRep },
  { role: "4th Year Rep", name: "Shainnah Lhyn Taborada", image: fourthRep },
];

const Community = () => {
  const [activeTab, setActiveTab] = useState("Advisors");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
    setCarouselIndex(0);  // Reset the carousel index when changing tabs
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
      {/* Floating Boxes */}
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute bg-neutral-light w-24 h-24 rounded-lg"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.3 }}
        />
      ))}

      <div className="text-center">
        <ul className="absolute z-30 pt-20 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4 text-white">
          {["Advisors", "Officers", "Developers"].map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer p-2 text-base sm:text-sm md:text-base ${activeTab === tab ? "font-bold border-b-2 border-primary" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>

        <div className="relative -top-2/4 translate-y-2/4">
          <section>
            {tabContent[activeTab] || <div>No content available</div>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Community;
