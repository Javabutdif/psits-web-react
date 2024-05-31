import React from "react";
import { Link } from "react-router-dom";
import home from "../assets/images/home.png";
import psits from "../assets/images/psits.jpg";
import sus from "../assets/images/sus.jpg";

function Home() {
  return (
    <div
      id="carouselData"
      className="carousel slide container p-0"
      data-ride="carousel"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img className="d-block w-100" src={psits} alt="First slide" />
        </div>
        <div className="carousel-item">
          <img className="d-block w-100" src={home} alt="Second slide" />
        </div>
        <div className="carousel-item">
          <img className="d-block w-100" src={sus} alt="Third slide" />
        </div>
      </div>
      <a
        className="carousel-control-prev"
        href="#carouselData"
        role="button"
        data-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </a>
      <a
        className="carousel-control-next"
        href="#carouselData"
        role="button"
        data-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </a>
    </div>
  );
}

export default Home;
