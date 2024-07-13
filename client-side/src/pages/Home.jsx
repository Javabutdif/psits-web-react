import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";
import home from "../assets/images/home.png";
import psits from "../assets/images/psits.jpg";
import sus from "../assets/images/sus.jpg";
import { useEffect } from "react";
import Hero from "../components/sections/home/Banner";
import About from "../components/sections/home/About";
import Footer from "../components/common/Footer";
import DeansMessage from "../components/sections/home/DeansMessage";
import CoreBeliefs from "../components/sections/home/CoreBeliefs";


function Home() {
  return (
    <>
    <Hero />
    <DeansMessage />
    <CoreBeliefs />
    <About />
    </>
    
    
  );
}

export default Home;
