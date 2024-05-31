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
    <div class="container text-center p-5">
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3">
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              President
            </h5>
            <img class="card-img-top" src={santoya} alt="Santoya" />
            <div class="card-body">
              <h4 class="card-title">Vince Andrew Santoya</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center "
              style={{ backgroundColor: "#074873" }}
            >
              Vice-President Internal
            </h5>
            <img class="card-img-top" src={leyros} alt="Leyros" />
            <div class="card-body">
              <h4 class="card-title">Aubrey Leyros</h4>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Vice-President External
            </h5>
            <img class="card-img-top" src={tuyor} alt="Tuyor" />
            <div class="card-body">
              <h4 class="card-title">Clint Louie Tuyor</h4>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Auditor
            </h5>
            <img class="card-img-top" src={laygan} alt="Laygan" />
            <div class="card-body">
              <h4 class="card-title">Daisy Lyn Laygan</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Secretary
            </h5>
            <img class="card-img-top" src={tadlip} alt="Tadlip" />
            <div class="card-body">
              <h4 class="card-title">Marlou Tadlip</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Treasurer
            </h5>
            <img class="card-img-top" src={gacang} alt="Gacang" />
            <div class="card-body">
              <h4 class="card-title">Jeraiza Gacang</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Assistant Treasurer
            </h5>
            <img class="card-img-top" src={echavez} alt="Echavez" />
            <div class="card-body">
              <h4 class="card-title">Stephanie Echavez</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              P.I.O
            </h5>
            <img class="card-img-top" src={villanueva} alt="Villanueva" />
            <div class="card-body">
              <h4 class="card-title">Princess Villanueva</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              Chief Volunteer
            </h5>
            <img class="card-img-top" src={de} alt="Reyes" />
            <div class="card-body">
              <h4 class="card-title">Rey Vincent De Los Reyes</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              P.R.O
            </h5>
            <img class="card-img-top" src={costillas} alt="Costillas" />
            <div class="card-body">
              <h4 class="card-title">John Paul Costillas</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              2nd Year Representative
            </h5>
            <img class="card-img-top" src={rallos} alt="Rallos" />
            <div class="card-body">
              <h4 class="card-title">Christ Hanzen Rallos</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              3rd Year Representative
            </h5>
            <img class="card-img-top" src={postrero} alt="Postrero" />
            <div class="card-body">
              <h4 class="card-title">Angela Postrero</h4>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-3">
            <h5
              class="card-header text-white text-center"
              style={{ backgroundColor: "#074873" }}
            >
              4th Year Representative
            </h5>
            <img class="card-img-top" src={taborada} alt="Taborada" />
            <div class="card-body">
              <h4 class="card-title">Shainnah Lhyn Taborada</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Officers;
