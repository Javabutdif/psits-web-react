import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InfinitySpin } from "react-loader-spinner";
import backendConnection from "../../api/backendApi";
import { showToast } from "../../utils/alertHelper";
import { getPosition } from "../../authentication/Authentication";

function AdminRegister() {
  const [formData, setFormData] = useState({
    id_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    course: "",
    year: "",
    position: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getPosition() !== "Developer") {
      navigate("/admin/dashboard");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password error trapping
    if (formData.password !== formData.confirmPassword) {
      showToast("error", "Passwords do not match");
      return;
    }

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
    <div className="container mx-auto mt-5">
      <div className="flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <InfinitySpin
              visible={true}
              width="200"
              color="#0d6efd"
              ariaLabel="infinity-spin-loading"
            />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="text-center text-xl font-bold mb-4">
                Register Admin
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="id_number"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    ID Number
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="id_number"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label
                    htmlFor="showPassword"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Show Password
                  </label>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="course"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Course
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="mb-4">
                  <label
                    htmlFor="year"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Year
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="mb-4">
                  <label
                    htmlFor="position"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Position
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Proceed
                  </button>
                  <Link
                    to="/login"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRegister;
