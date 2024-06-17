import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../../App.css";
import under from "../../assets/images/under.jfif";

function MembershipRenewal() {
  return (
    <div className="text-center ">
      <h1 className="text-center mt-5">Membership Renewal</h1>
      <img className="h-25 w-25" src={under} alt="Under" />
    </div>
  );
}

export default MembershipRenewal;
