import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../../App.css";
import under from "../../assets/images/under.jfif";

function MerchandiseHistory() {
  return (
    <div className="text-center ">
      <h1 className="text-center mt-5">History</h1>
      <img className="h-25 w-25" src={under} alt="Under" />
    </div>
  );
}

export default MerchandiseHistory;
