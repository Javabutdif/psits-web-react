// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import logo from "../../assets/images/psits-logo.png";
import { showToast } from "../../utils/alertHelper";
import { removeAuthentication } from "../../authentication/localStorage";
import { removeStudentData } from "../../utils/editStudentData";

function Navbar() {
  const handleLogoutClick = () => {
    removeAuthentication("AuthenticationToken");
    showToast("success", "Signed out successfully");
    handleRemoveStudentData();
  };
  const handleRemoveStudentData = () => {
    removeStudentData();
  };
  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        <img src={logo} alt="Logo" style={{ width: "3rem", height: "3rem" }} />
        <Link
          className="navbar-brand  ms-2"
          to="/adminDashboard"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
          onClick={handleRemoveStudentData}
        >
          Admin Dashboard
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
              <Link
                className="nav-link "
                to="/adminDashboard"
                onClick={handleRemoveStudentData}
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link "
                to="/viewStudents"
                onClick={handleRemoveStudentData}
              >
                Students
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
                Membership
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <Link
                  className="dropdown-item"
                  to="/membershipRequest"
                  onClick={handleRemoveStudentData}
                >
                  Membership Request
                </Link>
                <Link
                  className="dropdown-item"
                  to="/membershipRenewal"
                  onClick={handleRemoveStudentData}
                >
                  Membership Renewal
                </Link>
                <Link
                  className="dropdown-item"
                  to="/membershipHistory"
                  onClick={handleRemoveStudentData}
                >
                  History
                </Link>
              </div>
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
                Merchandise
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <Link
                  className="dropdown-item"
                  to="/merchandise"
                  onClick={handleRemoveStudentData}
                >
                  Merchandise
                </Link>
                <Link
                  className="dropdown-item"
                  to="/merchandiseOrders"
                  onClick={handleRemoveStudentData}
                >
                  Orders
                </Link>
                <Link
                  className="dropdown-item"
                  to="/merchandiseHistory"
                  onClick={handleRemoveStudentData}
                >
                  History
                </Link>
              </div>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link "
                to="/login"
                onClick={handleLogoutClick}
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
