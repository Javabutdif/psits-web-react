import React, { useState, useEffect } from "react";
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
import dennis from "../assets/Faculty/1.jpg";
import barral from "../assets/Faculty/2.jpg";
import jia from "../assets/Faculty/3.jpg";
import beans from "../assets/Development Team/29.png";
import driane from "../assets/Development Team/30.png";
import jims from "../assets/Development Team/28.png";
import marianne from "../assets/Development Team/31.png";

const faculty = [
  { name: "Dennis Durano", image: dennis, role: "Advicer" },
  { name: "Christian Barral", image: barral, role: "Advicer" },
  { name: "Jia Nova Montecino", image: jia, role: "Advicer" },
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
  { role: "President", name: "Vince Andrew Santoya", image: president },
  {
    role: "Vice President Internal",
    name: "Aubrey Leyros",
    image: viceInternal,
  },
  {
    role: "Vice President External",
    name: "Clint Louie Tuyor",
    image: viceExternal,
  },
  { role: "Secretary", name: "Marlou Tadlip", image: secretary },
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
  { role: "1st Year Rep", name: "Sainth Anneshka N. Cuico", image: firstRep },
  { role: "2nd Year Rep", name: "Christ Hanzen Rallos", image: secondRep },
  { role: "3rd Year Rep", name: "Angela Postrero", image: thirdRep },
  { role: "4th Year Rep", name: "Shainnah Lhyn Taborada", image: fourthRep },
];

const Community = () => {
  return (
    <>
      <section className="bg-gradient-to-b from-primary to-[#f2f2f2]">
        <Carousel members={faculty} />
      </section>

      <section>
        <Carousel members={officersAndReps} />
      </section>

      <section>
        <Carousel members={teamMembers} />
      </section>
    </>
  );
};

export default Community;
