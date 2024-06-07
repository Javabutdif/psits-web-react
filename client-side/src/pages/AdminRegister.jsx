import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../App.css";

function AdminRegister() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">Register</div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label for="id_number" className="form-label">
                    ID Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="id_number"
                    name="id_number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label for="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label for="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label for="position" className="form-label">
                    Position
                  </label>
                  <select
                    className="form-control"
                    id="position"
                    name="position"
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="President">President</option>
                    <option value="Vice-President Internal">
                      Vice-President Internal
                    </option>
                    <option value="Vice-President External">
                      Vice-President External
                    </option>
                    <option value="Auditor">Auditor</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Assistant Treasurer">
                      Assistant Treasurer
                    </option>
                    <option value="P.I.O">P.I.O</option>
                    <option value="P.R.O">P.R.O</option>
                    <option value="Chief Volunteer">Chief Volunteer</option>
                    <option value="1st Year Representative">
                      1st Year Representative
                    </option>
                    <option value="2nd Year Representative">
                      2nd Year Representative
                    </option>
                    <option value="3rd Year Representative">
                      3rd Year Representative
                    </option>
                    <option value="4th Year Representative">
                      4th Year Representative
                    </option>
                  </select>
                </div>

                <div className="row justify-content-between align-items-center">
                  <div className="col-md-6">
                    <button
                      type="submit"
                      className="btn btn-primary register-btn"
                    >
                      Proceed
                    </button>
                    <Link to="/login" className="btn btn-danger">
                      Back
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
