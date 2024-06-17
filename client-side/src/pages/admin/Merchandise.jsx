import React from "react";
import "../../App.css";
import under from "../../assets/images/under.jfif";

function Merchandise() {
  return (
    <div className="text-center ">
      <h1 className="text-center mt-5">Merchandise</h1>
      <img className="h-25 w-25" src={under} alt="Under" />
    </div>
  );
}

export default Merchandise;
