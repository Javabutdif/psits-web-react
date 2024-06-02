import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import jims from "../assets/images/jims.jpg";

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
              Project Lead / Backend
            </h5>
            <img className="card-img-top" src={jims} alt="Genabio" />
            <div className="card-body">
              <h4 className="card-title">Anton James Genabio</h4>
              <p>
                Facebook:{" "}
                <a href="https://www.facebook.com/jgenabs/">James Genabio</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Developers;
