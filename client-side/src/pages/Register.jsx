import React from "react";
import { Route } from "react-router-dom";

function Register() {
  return (
    <div className="container mt-5 ">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div
              className="card-body text-white rounded-3"
              style={{ backgroundColor: "#074873 " }}
            >
              <div className="my-3 pt-2s">
                <label for="id_number" className="form-label">
                  ID Number
                </label>
                <input
                  type="number"
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
                <label for="confirmpassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmpassword"
                  name="confirmpassword"
                  required
                />
              </div>
              <span
                id="passwordMismatch"
                style={{ color: "red", display: "none " }}
              >
                Passwords do not match
              </span>
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label for="first_name" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="first_name"
                      name="first_name"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label for="middle_name" className="form-label">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="middle_name"
                      name="middle_name"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label for="last_name" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="last_name"
                      name="last_name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label for="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  required
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label for="course" className="form-label">
                      Course
                    </label>
                    <select
                      className="form-control"
                      id="course"
                      name="course"
                      required
                    >
                      <option value="">Select Course</option>
                      <option value="BSIT">BSIT</option>
                      <option value="BSCS">BSCS</option>
                      <option value="ACT">ACT</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label for="year" className="form-label">
                      Year
                    </label>
                    <select
                      className="form-control"
                      id="year"
                      name="year"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row justify-content-between align-items-center">
                <div className="col-md-6 ">
                  <button type="button" className="btn btn-primary me-2">
                    Proceed
                  </button>
                  <a href="Login.php" className="btn btn-danger">
                    Back
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
