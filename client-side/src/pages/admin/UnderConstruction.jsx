import React from "react";
import "../../App.css";
import under from "../../assets/images/under.jfif";

function UnderConstruction() {
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <h1 className="text-center mt-5 text-xl">
        This place is under construction!
      </h1>
      <img className="h-96 w-96" src={under} alt="Under Construction" />
    </div>
  );
}

export default UnderConstruction;
