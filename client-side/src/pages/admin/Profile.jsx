import React, { useState } from "react";
import { getInformationData } from "../../authentication/Authentication";
import { edit } from "../../api/students";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormButton from "../../components/forms/FormButton";
import FormTextArea from "../../components/forms/FormTextArea";

const Profile = () => {
  const [id, name, email, course, year, role, position] = getInformationData();
  const [profile, setProfile] = useState({
    id_number: id,
    name: name,
    bio: "",
    email: email,
    course: course,
    year: year,
    role: role,
    position: position,
  });

  const [isEditable, setIsEditable] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleEdit = () => setIsEditable(true);
  const handleCancel = () => setIsEditable(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    edit(profile);
    setIsEditable(false);
  };

  const courseOptions = [
    { value: "BSIT", label: "BSIT" },
    { value: "BSCS", label: "BSCS" },
    { value: "ACT", label: "ACT" },
  ];

  const yearOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
  ];

  return (
    <div className="py-5">
      <div className="w-full rounded-sm bg-white p-6">
      <h3 className="text-md md:text-lg font-bold mb-2 md:mb-3">Your Profile</h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-2 md:space-y-4 lg:space-y-6"
      >
        <div className="flex flex-col items-center mb-2 md:mb-4">
          <div className="mt-2 flex justify-center">
            <img
              alt="Profile Preview"
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border border-gray-300"
            />
          </div>
          <label className="block text-xs md:text-sm font-medium text-gray-700">
            Upload Photo
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="block w-28 p-1 text-xs rounded-md cursor-pointer"
            disabled={!isEditable && role !== "Student"}
            onChange={handleChange}
          />
        </div>

        {role === "Admin" ? (
          <div className="space-y-2">
            <FormInput
              label="ID Number"
              type="text"
              id="id-number"
              value={profile.id_number}
              name="id_number"
              onChange={handleChange}
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled={!isEditable}
            />
            <FormInput
              label="Full Name"
              type="text"
              id="name"
              value={profile.name}
              name="name"
              onChange={handleChange}
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled={!isEditable}
            />
            <FormInput
              label="Position"
              type="text"
              id="position"
              value={profile.position}
              name="position"
              onChange={handleChange}
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled={!isEditable}
            />
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <FormSelect
                label="Course"
                name="course"
                value={profile.course}
                onChange={handleChange}
                options={courseOptions}
                styles="flex-1 text-xs"
                disabled={!isEditable}
              />
              <FormSelect
                label="Year"
                name="year"
                value={profile.year}
                onChange={handleChange}
                options={yearOptions}
                styles="flex-1 text-xs"
                disabled={!isEditable}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <FormInput
              label="ID Number"
              type="text"
              id="id-number"
              value={profile.id_number}
              name="id_number"
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled
            />
            <FormInput
              label="Full Name"
              type="text"
              id="name"
              value={profile.name}
              name="name"
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled
            />
            <FormInput
              label="Email"
              type="text"
              id="email"
              value={email}
              name="email"
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled
            />
            <FormSelect
              label="Course"
              name="course"
              value={profile.course}
              onChange={handleChange}
              options={courseOptions}
              styles="w-full text-xs"
              disabled
            />
            <FormSelect
              label="Year"
              name="year"
              value={profile.year}
              onChange={handleChange}
              options={yearOptions}
              styles="w-full text-xs"
              disabled
            />
            <FormTextArea
              label="Bio"
              type="text"
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              styles="w-full p-1 text-xs border border-gray-300 rounded-md"
              disabled={!isEditable && role !== "Student"}
            />
          </div>
        )}

        {isEditable ? (
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <FormButton
              type="button"
              text="Cancel"
              onClick={handleCancel}
              styles="flex-1 bg-gray-500 hover:bg-gray-400 text-white p-1 text-xs rounded-md"
            />
            <FormButton
              type="submit"
              text="Save"
              styles="flex-1 bg-blue-500 hover:bg-blue-400 text-white p-1 text-xs rounded-md"
            />
          </div>
        ) : (
          <FormButton
            type="button"
            text="Edit"
            onClick={handleEdit}
            styles="w-full bg-blue-500 hover:bg-blue-400 text-white p-1 text-xs rounded-md"
          />
        )}
      </form>
    </div>
    </div>
  );
};

export default Profile;
