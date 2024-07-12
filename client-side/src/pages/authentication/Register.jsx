import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/alertHelper.js";
import RegistrationConfirmationModal from "../../components/common/RegistrationConfirmationModal.jsx";
import logo from "../../assets/images/psits-logo.png";
import FormInput from "../../components/forms/FormInput.jsx";
import FormButton from "../../components/forms/FormButton.jsx";
import FormSelect from "../../components/forms/FormSelect.jsx";
import { register } from "../../api/index.js";

function Register() {
  const [formData, setFormData] = useState({
    id_number: "",
    rfid: "",
    password: "",
    confirm_password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    course: "",
    year: "",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const showModal = () => {
    if (formData.password !== formData.confirm_password) {
      showToast("error", "Passwords do not match.");
      return;
    }
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (await register(formData)) {
        //Return true if na register otherwise false
        showToast("success", "Registration successful");
        setIsModalVisible(true); // Show modal after successful registration
        // Optionally, you can reset form data here
        setFormData({
          id_number: "",
          rfid: "",
          password: "",
          confirm_password: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          course: "",
          year: "",
        });
        navigate("/login");
      } else {
        showToast("error", JSON.stringify(response));
      }
    } catch (error) {
      showToast("error", JSON.stringify(error));
    }
    setIsLoading(false);
  };

  const handleNavigate = (pageRoute) => () => {
    navigate(pageRoute);
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="max-w-lg md:max-w-4xl space-y-8 sm:space-y-10 w-full flex flex-col md:flex-row md:items-stretch items-center justify-center font-montserrat bg-white shadow-lg rounded-lg">
        <div className="flex md:flex-col md:justify-center md:items-center md:space-y-5 md:text-center md:border-0 bg-[#074873] text-white space-x-4 p-4 rounded-t rounded-b-2xl items-center">
          <img src={logo} alt="PSITS Logo" className="w-24 h-24" />
          <div className="border-white border-l-2 md:border-0 md:pl-0 pl-4">
            <h3 className="text-l sm:text-2xl font-bold uppercase">Register</h3>
            <p className="text-xs sm:text-sm md:text-md">
              Become a PSITS Member! Start your tech journey and build lasting
              connections.
            </p>
          </div>
        </div>
        <form
          className="w-full  space-y-4 px-5 lg:px-8 pb-10"
          onSubmit={handleSubmit}
        >
          <FormInput
            label={"ID Number"}
            type="text"
            id="id_number"
            name="id_number"
            value={formData.id_number}
            onChange={handleChange}
            styles="w-full p-2 border border-gray-300 rounded"
          />

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <FormInput
              label={"First Name"}
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
            <FormInput
              label={"Middle Name"}
              type="text"
              id="middle_name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
            <FormInput
              label={"Last Name"}
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <FormInput
            label={"Email Address"}
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            styles="w-full p-2 border border-gray-300 rounded"
          />

          <div className="flex  justify-between space-x-4">
            <FormSelect
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              options={courseOptions}
              styles="flex-1"
            />
            <FormSelect
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              options={yearOptions}
              styles="flex-1"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 justify-between sm:space-y-0 sm:space-x-4">
            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
            <FormInput
              label="Confirm Password"
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <FormButton
            type="submit"
            text="Register"
            styles="w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
          />

          <div className="text-sm sm:text-md flex items-center justify-center">
            <p>Already have an account? </p>
            <FormButton
              type={"button"}
              text={"Sign in"}
              onClick={handleNavigate("/Login")}
              styles="text-xs m-2"
              // variants={buttonVariants}
            />
          </div>
        </form>
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
