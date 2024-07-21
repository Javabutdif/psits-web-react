import React, { useState } from "react";
import { getStudent } from "../../authentication/Authentication";
import "../../App.css";
import { edit } from "../../api/students";

const Profile = () => {
  const [id, name, email, course, year] = getStudent();
  const [profile, setProfile] = useState({
    id_number: id,
    fullName: name,
    bio: "",
    email: email,
    course: course,
    year: year,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    edit(profile);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-10 text-gray-500 border-b-2 border-gray-300 pb-2">
        Your Profile
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex mb-6">
          <div className="border-r-2 border-gray-300">
            <div className="flex flex-col items-center mx-10 my-10 ">
              <div className="w-26 h-26 mb-6 ">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2  text-white rounded-lg"
                style={{ backgroundColor: " #002E48" }}
              >
                Upload Profile
              </button>
            </div>
          </div>
          <div className="flex-grow ml-7">
            <h1 className="mb-12 text-gray-500">Personal Information</h1>
            <div className=" mb-4">
              <label className="block font-color">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={profile.id_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block font-color">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block font-color">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block font-color">Email Account</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex mb-4">
              <div className="w-1/2 pr-2">
                <label className="block font-color">Course</label>
                <select
                  name="course"
                  value={profile.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Course</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                  <option value="ACT">ACT</option>
                </select>
              </div>
              <div className="w-1/2 pl-2">
                <label className="block font-color">Year</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Year</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 text-white py-2 rounded-lg"
                style={{ backgroundColor: "#4398AC" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2  text-white rounded-lg"
                style={{ backgroundColor: " #002E48" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
