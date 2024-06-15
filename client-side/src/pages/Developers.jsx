import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../App.css";
import jims from "../assets/images/jims.jpg";
import kirby from "../assets/images/kirby.gif";
import hutao from "../assets/images/hutao.gif";
import cat from "../assets/images/cat.gif";

function Developers() {
  return (
    <div className="container text-center p-5">
      <h1 className="mb-5" style={{ color: "#074873" }}>
        Developers
      </h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Project Lead / Fullstack
            </h5>
            <img className="card-img-top" src={hutao} alt="Jims" />
            <div className="card-body">
              <h4 className="card-title">Jims</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center "
              style={{ backgroundColor: "#074873" }}
            >
              Fullstack
            </h5>
            <img className="card-img-top" src={kirby} alt="Adriane" />
            <div className="card-body">
              <h4 className="card-title">Adriane</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center "
              style={{ backgroundColor: "#074873" }}
            >
              UI / UX Designer
            </h5>
            <img className="card-img-top" src={cat} alt="Marianne" />
            <div className="card-body">
              <h4 className="card-title">Marianne</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Developers;
