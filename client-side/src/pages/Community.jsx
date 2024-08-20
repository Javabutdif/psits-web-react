import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import president from '../assets/images/santoya.jpg';
import viceInternal from '../assets/images/leyros.jpg';
import viceExternal from '../assets/images/tuyor.jpg';
import secretary from '../assets/images/tadlip.jpg';
import auditor from '../assets/images/laygan.jpg';
import treasurer from '../assets/images/gacang.jpg';
import assistantTreasurer from '../assets/images/villanueva.jpg';
import pio from '../assets/images/laygan.jpg';
import pro from '../assets/images/costillas.jpg';
import firstRep from '../assets/images/rallos.jpg';
import secondRep from '../assets/images/postrero.jpg';
import thirdRep from '../assets/images/taborada.jpg';
import Carousel from "../components/Carousel/Carousel";
import beans from "../assets/images/beans.gif";
import kirby from "../assets/images/kirby.gif";
import hutao from "../assets/images/hutao.gif";
import cat from "../assets/images/cat.gif";

const teamMembers = [
  { name: "Jims", image: hutao, label: "Lead Developer" },
  { name: "Beans", image: beans, label: "Front End Developer" },
  { name: "Driane", image: kirby, label: "FullStack Developer" },
  { name: "Marianne", image: cat, label: "Web Designer" },
];

const officersAndReps = [
  { role: 'President', name: 'Vince Andrew Santoya', image: president },
  { role: 'Vice President Internal', name: 'Aubrey Leyros', image: viceInternal },
  { role: 'Vice President External', name: 'Clint Louie Tuyor', image: viceExternal },
  { role: 'Secretary', name: 'Marlou Tadlip', image: secretary },
  { role: 'Auditor', name: 'Daisy Lyn Laygan', image: auditor },
  { role: 'Treasurer', name: 'Jeraiza Gacang', image: treasurer },
  { role: 'Asst. Treasurer', name: 'Stephanie Echavez', image: assistantTreasurer },
  { role: 'P.I.O', name: 'Princess Villanueva', image: pio },
  { role: 'P.R.O', name: 'John Paul Costillas', image: pro },
  { role: 'Chief Volunteer', name: 'Rey Vincent De Los Reyes', }, // Same image used here
  { role: '1st Year Rep', name: 'Sainth Anneshka N. Cuico', image: firstRep },
  { role: '2nd Year Rep', name: 'Christ Hanzen Rallos', image: secondRep },
  { role: '3rd Year Rep', name: 'Angela Postrero', image: thirdRep },
  { role: '4th Year Rep', name: 'Shainnah Lhyn Taborada', image: thirdRep } // Assuming thirdRep is used for 4th Year Rep
];

const Community = () => {

  return (
    <>
        <section>
            <Carousel members={officersAndReps}/>
        </section>
    
        <section>
            <Carousel members={teamMembers}/>
        </section>
    
    </>
  );
};

export default Community;
