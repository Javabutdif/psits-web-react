import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import santoya from "../assets/images/santoya.jpg";
import leyros from "../assets/images/leyros.jpg";
import tuyor from "../assets/images/tuyor.jpg";
import de from "../assets/images/de.jpg";
import echavez from "../assets/images/echavez.jpg";
import gacang from "../assets/images/gacang.jpg";
import laygan from "../assets/images/laygan.jpg";
import postrero from "../assets/images/postrero.jpg";
import rallos from "../assets/images/rallos.jpg";
import taborada from "../assets/images/taborada.jpg";
import tadlip from "../assets/images/tadlip.jpg";
import villanueva from "../assets/images/villanueva.jpg";
import costillas from "../assets/images/costillas.jpg";

function Officers() {
  return (
    <div className="container text-center p-5">
      <h1 className="mb-5" style={{ color: "#074873" }}>
        Officers
      </h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              President
            </h5>
            <img className="card-img-top" src={santoya} alt="Santoya" />
            <div className="card-body">
              <h4 className="card-title">Vince Andrew Santoya</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center "
              style={{ backgroundColor: "#074873" }}
            >
              Vice-President Internal
            </h5>
            <img className="card-img-top" src={leyros} alt="Leyros" />
            <div className="card-body">
              <h4 className="card-title">Aubrey Leyros</h4>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Vice-President External
            </h5>
            <img className="card-img-top" src={tuyor} alt="Tuyor" />
            <div className="card-body">
              <h4 className="card-title">Clint Louie Tuyor</h4>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Auditor
            </h5>
            <img className="card-img-top" src={laygan} alt="Laygan" />
            <div className="card-body">
              <h4 className="card-title">Daisy Lyn Laygan</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Secretary
            </h5>
            <img className="card-img-top" src={tadlip} alt="Tadlip" />
            <div className="card-body">
              <h4 className="card-title">Marlou Tadlip</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Treasurer
            </h5>
            <img className="card-img-top" src={gacang} alt="Gacang" />
            <div className="card-body">
              <h4 className="card-title">Jeraiza Gacang</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Assistant Treasurer
            </h5>
            <img className="card-img-top" src={echavez} alt="Echavez" />
            <div className="card-body">
              <h4 className="card-title">Stephanie Echavez</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              P.I.O
            </h5>
            <img className="card-img-top" src={villanueva} alt="Villanueva" />
            <div className="card-body">
              <h4 className="card-title">Princess Villanueva</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Chief Volunteer
            </h5>
            <img className="card-img-top" src={de} alt="Reyes" />
            <div className="card-body">
              <h4 className="card-title">Rey Vincent De Los Reyes</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              P.R.O
            </h5>
            <img className="card-img-top" src={costillas} alt="Costillas" />
            <div className="card-body">
              <h4 className="card-title">John Paul Costillas</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              2nd Year Representative
            </h5>
            <img className="card-img-top" src={rallos} alt="Rallos" />
            <div className="card-body">
              <h4 className="card-title">Christ Hanzen Rallos</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              3rd Year Representative
            </h5>
            <img className="card-img-top" src={postrero} alt="Postrero" />
            <div className="card-body">
              <h4 className="card-title">Angela Postrero</h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card mb-3">
            <h5
              className="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              4th Year Representative
            </h5>
            <img className="card-img-top" src={taborada} alt="Taborada" />
            <div className="card-body">
              <h4 className="card-title">Shainnah Lhyn Taborada</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Officers;
