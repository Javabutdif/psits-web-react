import { register } from "../../api/index.js";
import logo from "../../assets/images/psits-logo.png";
import RegistrationConfirmationModal from "../../components/common/modal/RegistrationConfirmationModal.jsx";
import FormButton from "../../components/forms/FormButton.jsx";
import FormInput from "../../components/forms/FormInput.jsx";
import FormSelect from "../../components/forms/FormSelect.jsx";
import { showToast } from "../../utils/alertHelper.js";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { IoArrowBack } from "react-icons/io5";
import { InfinitySpin } from "react-loader-spinner";
import { capitalizeWord } from "../../components/tools/clientTools.js";

function Register() {
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    const formattedDate = format(startDate, "MMMM d, yyyy h:mm:ss a");
    setFormData((prevData) => ({
      ...prevData,
      applied: formattedDate,
    }));
  }, [startDate]);

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
    applied: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };
  const validateInputs = () => {
    const newErrors = {};

    const trimmedFormData = {
      id_number: formData.id_number?.trim(),
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      email: formData.email?.trim(),
      course: formData.course?.trim(),
      year: formData.year?.trim(),
      password: formData.password?.trim(),
      confirm_password: formData.confirm_password?.trim(),
    };

    if (!trimmedFormData.id_number) {
      newErrors.id_number = "ID Number is required.";
    } else if (!/^\d+$/.test(trimmedFormData.id_number)) {
      newErrors.id_number = "Invalid ID Number.";
    } else if (trimmedFormData.id_number.length !== 8) {
      newErrors.id_number = "ID Number must only contain 8 digits.";
    }

    if (!trimmedFormData.first_name) {
      newErrors.first_name = "First Name is required.";
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(trimmedFormData.first_name)) {
      newErrors.first_name = "Invalid First Name.";
    }

    if (!trimmedFormData.last_name) {
      newErrors.last_name = "Last Name is required.";
    } else if (!/^[A-Za-z]+$/.test(trimmedFormData.last_name)) {
      newErrors.last_name = "Invalid Last Name.";
    }

    if (!trimmedFormData.email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedFormData.email)
    ) {
      newErrors.email = "Invalid Email.";
    }

    if (!trimmedFormData.course) {
      newErrors.course = "Course is required.";
    }

    if (!trimmedFormData.year) {
      newErrors.year = "Year is required.";
    }

    if (!trimmedFormData.password) {
      newErrors.password = "Password is required.";
    } else if (trimmedFormData.password.length < 8) {
      newErrors.password = "Password too short.";
    } else if (!/[a-z]/.test(trimmedFormData.password)) {
      newErrors.password = "Include a lowercase letter.";
    } else if (!/[A-Z]/.test(trimmedFormData.password)) {
      newErrors.password = "Include an uppercase letter.";
    }

    if (!trimmedFormData.confirm_password) {
      newErrors.confirm_password = "Confirm Password is required.";
    } else if (trimmedFormData.password !== trimmedFormData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    return newErrors;
  };

  const showModal = (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
    const trimmedFormData = {
      id_number: formData.id_number?.trim(),
      first_name: capitalizeWord(formData.first_name?.trim()),
      middle_name: capitalizeWord(formData.middle_name?.trim()),
      last_name: capitalizeWord(formData.last_name?.trim()),
      email: formData.email?.trim(),
      course: formData.course?.trim(),
      year: formData.year?.trim(),
      password: formData.password?.trim(),
      applied: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
    };
    setIsModalVisible(false);
    try {
      if (await register(trimmedFormData)) {
        showToast("success", "Registration successful");

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
      }
    } catch (error) {
      showToast("error", JSON.stringify(error));
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleNavigate = (pageRoute) => () => {
    navigate(pageRoute);
  };

  const courseOptions = [
    { value: "BSIT", label: "BSIT" },
    { value: "BSCS", label: "BSCS" },
  ];

  const yearOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
  ];

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-full">
          <InfinitySpin
            visible={true}
            width={200}
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="relative max-w-lg md:max-w-4xl space-y-8 sm:space-y-10 w-full flex flex-col md:flex-row md:items-stretch items-center justify-center bg-white shadow-lg rounded-lg"
        >
          <div className="flex md:flex-col md:justify-center md:items-center md:space-y-5 md:text-center md:border-0 bg-[#074873] text-white space-x-4 p-4 rounded-t md:rounded-l-lg items-center">
            <button
              type="button"
              onClick={handleBack}
              className="hidden md:block absolute top-4 left-4 bg-opacity-0 text-white transition duration-300 ease-in-out transform hover:scale-105"
            >
              <IoArrowBack size={25} />
            </button>
            <img
              src={logo}
              alt="PSITS Logo"
              className="w-16 h-16 md:w-24 md:h-24"
            />
            <div className="border-white border-l-2 md:border-0 md:pl-0 pl-4">
              <h3 className="text-l sm:text-2xl font-bold uppercase">
                Register
              </h3>
              <p className="w-full md:w-48 text-xs sm:text-sm md:text-md">
                Become a PSITS Member! Start your tech journey and build lasting
                connections.
              </p>
            </div>
          </div>
          <form
            className="w-full space-y-6 px-4 lg:px-6 pb-10"
            onSubmit={showModal}
          >
            {/* Form inputs */}
            <FormInput
              label={"ID Number"}
              type="text"
              id="id_number"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              error={errors.id_number}
              styles="w-full p-2 border border-gray-300 rounded"
            />

            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
              <FormInput
                label={"First Name"}
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
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
                errorStyles={""}
                error={errors.middle_name}
              />
              <FormInput
                label={"Last Name"}
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
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
              error={errors.email}
              styles="w-full p-2 border border-gray-300 rounded"
            />

            <div className="flex justify-between space-x-4">
              <FormSelect
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                options={courseOptions}
                error={errors.course}
                styles="flex-1"
              />
              <FormSelect
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                options={yearOptions}
                error={errors.year}
                styles="flex-1"
              />
            </div>

            <div className="flex flex-col space-x-0 space-y-5 sm:space-x-5 sm:space-y-0 sm:flex-row">
              <FormInput
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                styles="flex-1 p-2 border border-gray-300 rounded"
              />
              <FormInput
                label="Confirm Password"
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                styles="flex-1 p-2 border border-gray-300 rounded"
              />
            </div>
            <FormButton
              type="submit"
              text="Register"
              styles="w-full hover:bg-[#074873] bg-[#08568a] text-white p-2 rounded"
            />

            <div className="text-sm sm:text-md flex items-center justify-center">
              <p>Already have an account? </p>
              <FormButton
                type={"button"}
                text={"Sign in"}
                onClick={handleNavigate("/Login")}
                styles="text-xs m-2"
              />
            </div>
          </form>
        </motion.div>
      )}

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
