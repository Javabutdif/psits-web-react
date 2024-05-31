import React from "react";

function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#074873" }}
    >
      <div className="container-fluid">
        <a
          className="navbar-brand text-white ms-2"
          href="index.php"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          UC Main - PSITS
        </a>
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
              <a className="nav-link text-white" href="index.php">
                Home
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle text-white"
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
                <a className="dropdown-item" href="#">
                  Faculty Members
                </a>
                <a className="dropdown-item" href="Officers.php">
                  Officers
                </a>
                <a className="dropdown-item" href="Developers.php">
                  Developers
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="Login.php">
                Login
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="Register.php">
                Register
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
