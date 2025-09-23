import { React, useEffect } from "react";
import Banner from "../components/sections/home/Banner";
import DeansMessage from "../components/sections/home/DeansMessage";
import About from "../components/sections/home/About";
import CoreValues from "../components/sections/home/CoreValues";
import Goals from "../components/sections/home/Goals";
import MissionVision from "../components/sections/home/MissionVision";
import { removeAuthentication } from "../authentication/Authentication";

const Home = () => {
  useEffect(() => {
    // Define an async function inside useEffect
    const logoutAndClearAuth = async () => {
      removeAuthentication();
    };

    logoutAndClearAuth();
  }, []);

  return (
    <>
      <Banner />
      <DeansMessage />
      <MissionVision />
      <Goals />
      <CoreValues />
      <About />
    </>
  );
};

export default Home;
