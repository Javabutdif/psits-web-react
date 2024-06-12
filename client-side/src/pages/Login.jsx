import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BackendConnection from "../api/BackendApi";
import { showToast } from "../utils/alertHelper";
import {
  setAuthentication,
  attemptAuthentication,
  getAttemptAuthentication,
  resetAttemptAuthentication,
  getTimeout,
  timeOutAuthentication,
} from "../Authentication/LocalStorage";

function Login() {
  const [formData, setFormData] = useState({
    id_number: "",
    password: "",
  });

  //Navigate to another route
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (getAttemptAuthentication() < 3 && getTimeout() === null) {
        const response = await fetch(`${BackendConnection()}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();

        if (response.ok && data.role === "Admin") {
          showToast("success", "Signed in successfully");
          setAuthentication(
            data.name,
            data.id_number,
            data.role,
            data.position
          );
          resetAttemptAuthentication();
          navigate("/adminDashboard");
        } else if (response.ok && data.role === "Student") {
          resetAttemptAuthentication();
          showToast("success", "Signed in successfully Student");
          setAuthentication(
            data.name,
            data.id_number,
            data.role,
            data.position
          );
          navigate("/studentDashboard");
        } else {
          showToast("error", data);
          attemptAuthentication();
        }
      } else {
        showToast("error", "Retry after 3 attempts, wait 1 minute.");
        console.log(getTimeout());
        console.log(getAttemptAuthentication());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5 border-0">
            <div
              className="card-body text-white rounded-4"
              style={{ backgroundColor: "#074873" }}
            >
              <h3 className="card-title text-center mb-4">Login</h3>
              <form onSubmit={handleSubmit} className="px-4">
                <div className="mb-3">
                  <label htmlFor="id_number" className="form-label">
                    ID Number
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="id_number"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="text-center my-4">
                  <button
                    type="submit"
                    className="btn btn-outline-light p-2 px-4"
                  >
                    Login
                  </button>
                  <p className="my-3">
                    Don't have an account?{" "}
                    <Link to="/register">Click Here!</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
