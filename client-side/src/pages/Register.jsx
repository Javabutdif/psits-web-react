import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BackendConnection from "../api/BackendApi";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { showToast } from "../utils/alertHelper";
import RegistrationConfirmationModal from "../components/common/RegistrationConfirmationModal.jsx";

function Register() {
  const [formData, setFormData] = useState({
    id_number: "",
    rifd: "",
    password: "",
    confirmpassword: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    course: "",
    year: "",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const showModal = () => {
    if (formData.password !== formData.confirmpassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    hideModal();

    try {
      const response = await fetch(`${BackendConnection()}/api/register`, {
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
        // Handle error
      }
    } catch (error) {
      showToast("error", JSON.stringify(error));
      // Handle error
    }
  };

  return (
    <div className="container mt-5 ">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div
              className="card-body text-white rounded-3"
              style={{ backgroundColor: "#074873 " }}
            >
              <h3 className="card-title text-center mb-4">Register</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="my-3 pt-2">
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
                <div className="mb-3">
                  <label htmlFor="confirmpassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmpassword"
                    name="confirmpassword"
                    value={formData.confirmpassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                {passwordMismatch && (
                  <span id="passwordMismatch" style={{ color: "red" }}>
                    Passwords do not match
                  </span>
                )}
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="first_name" className="form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="middle_name" className="form-label">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="middle_name"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="last_name" className="form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="course" className="form-label">
                        Course
                      </label>
                      <select
                        className="form-control"
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
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
                      <label htmlFor="year" className="form-label">
                        Year
                      </label>
                      <select
                        className="form-control"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
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
                    <button
                      type="button"
                      onClick={showModal}
                      className="btn btn-primary me-2"
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
      {isModalVisible && (
        <RegistrationConfirmationModal
          formData={formData}
          onSubmit={handleSubmit}
          onCancel={hideModal}
        />
      )}
    </div>
  );
}

export default Register;
