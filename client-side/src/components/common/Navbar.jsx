// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import logo from "../../assets/images/psits-logo.png";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        <img src={logo} alt="Logo" style={{ width: "3rem", height: "3rem" }} />
        <Link
          className="navbar-brand  ms-2"
          to="/home"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          UC Main - PSITS
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link " to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle "
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Community
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <Link className="dropdown-item" to="/community">
                  Faculty Members
                </Link>
                <Link className="dropdown-item" to="/officers">
                  Officers
                </Link>
                <Link className="dropdown-item" to="/developers">
                  Developers
                </Link>
              </div>
            </li>
            <li className="nav-item">
              <Link className="nav-link " to="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
