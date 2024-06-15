import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../App.css";
import { useNavigate } from "react-router-dom";
import backendConnection from "../api/backendApi";
import { showToast } from "../utils/alertHelper";
import { InfinitySpin } from "react-loader-spinner";

function AdminRegister() {
  const [formData, setFormData] = useState({
    id_number: "",
    password: "",
    name: "",
    position: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${backendConnection()}/api/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        showToast("success", "Registration successful");

        navigate("/login");
      } else {
        showToast("error", JSON.stringify(data));
      }
    } catch (error) {
      showToast("error", JSON.stringify(error));
    }
    setIsLoading(false);
  };
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        {isLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "60vh" }}
          >
            <InfinitySpin
              visible={true}
              width="200"
              color="#0d6efd"
              ariaLabel="infinity-spin-loading"
            />
          </div>
        ) : (
          <div className="col-md-6">
            <div className="card">
              <div className="card-header text-center">Register Admin</div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="id_number" className="form-label">
                      ID Number
                    </label>
                    <input
                      type="text"
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

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="position" className="form-label">
                      Position
                    </label>
                    <select
                      className="form-control"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
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
                      <option value="Developer">Developer</option>
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
        )}
      </div>
    </div>
  );
}

export default AdminRegister;
