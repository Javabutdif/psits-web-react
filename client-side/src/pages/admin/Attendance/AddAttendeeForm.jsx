import { format } from "date-fns";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import FormSelect from "../../../components/forms//FormSelect.jsx";
import FormButton from "../../../components/forms/FormButton";
import FormInput from "../../../components/forms/FormInput.jsx";
// import ViewStudentAttendance from "./ViewStudentAttendance.jsx";
// import { AiOutlineClose } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import ConfirmAttendeeModal from "./ConfirmAttendeeModal.jsx";
import { getInformationData } from "../../../authentication/Authentication.js";
import { useParams } from "react-router-dom";
import { addAttendee } from "../../../api/event.js";

const AddAttendeeForm = (merchId) => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [useModal, setUseModal] = useState(false);
  const navigate = useNavigate();
  const user = getInformationData();
  const { eventId } = useParams();

  const priceBySize = 1000;
  // FormData
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    course: "",
    year: "",
    campus: user.campus,
    email: "",
    shirt_size: "",
    merchId: eventId,
    shirt_price: "",

    applied: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
  });

  const validateInputs = () => {
    const newErrors = {};

    const trimmedFormData = {
      id_number: formData.id_number?.trim(),
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      email: formData.email?.trim(),
      course: formData.course?.trim(),
      year: formData.year?.trim(),
      campus: formData.campus?.trim(),
      shirt_size: formData.shirt_size?.trim(),
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

    if (!trimmedFormData.campus) {
      newErrors.campus = "Campus is required.";
    }

    if (!trimmedFormData.shirt_size) {
      newErrors.shirt_size = "T-Shirt Size is required.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fakeRegester = (passedFormData) => {
    // console.log(passedFormData.first_name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});

      setUseModal(true); // Show modal on successful validation
    }
  };

  const handleModalConfirm = async () => {
    setUseModal(false);
    if (await addAttendee(formData)) {
      addAttendeeToList();
    }
  };
  const addAttendeeToList = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 seconds delay
      setFormData({
        id_number: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        course: "",
        year: "",
        campus: user.campus,
        email: "",
        shirt_size: "",
        merchId: eventId,
        shirt_price: "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setUseModal(false);
  };
  const showModal = () => {
    setUseModal(true);
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

  const campusOptions = [
    { value: "UC-Main", label: "UC-MAIN" },
    { value: "UC-Banilad", label: "UC-BANILAD" },
    { value: "UC-LM", label: "UC-LM" },
    { value: "UC-PT", label: "UC-PT" },
  ];

  const sizeOptions = [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "2XL", label: "2XL" },
    { value: "3XL", label: "3XL" },
  ];

  // const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  // Simulate loading part
  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 seconds delay
      console.log("Data fetched successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container lg:w-8/12 lg:h-8/12 p-6 ">
      {loading ? (
        <div className="flex flex-row justify-center ">
          <InfinitySpin
            visible={true}
            width={200}
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <div class="flex flex-col gap-5 p-2 md:flex-col sm:flex-col bg-white">
          <motion.div className="flex flex-col justify-center p-2 gap-5">
            {/* Header */}
            <div className="flex w-full px-5 p-2">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ">
                Attendee Information ({user.campus})
              </h2>
            </div>

            {/* Form */}
            <div className="border-black-10">
              <form
                className="flex flex-col w-full space-y-6 p-4  lg:p-5"
                onSubmit={handleSubmit}
              >
                {/* Form inputs */}
                {/* Id Num */}
                <div className="flex flex-col justify-center gap-6 sm:gap-4 md:gap-6">
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

                  {/* Student NAme */}
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
                  {/* Email Address */}
                  <div className="flex flex-col justify-center  w-full">
                    <FormInput
                      label={"Email Address"}
                      type="text"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      styles=" w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex flex-row items-center gap-5">
                    {/* T-Shirt Size Select */}
                    <div className="flex flex-col justify-center w-8/12 sm:w-full">
                      <FormSelect
                        label="T-Shirt Size"
                        name="shirt_size"
                        value={formData.shirt_size}
                        onChange={handleChange}
                        options={sizeOptions}
                        error={errors.shirt_size}
                        styles="flex-1"
                      />
                    </div>

                    {/* Price Display */}
                    <div className="flex flex-row items-center gap-5">
                      <div className="flex flex-col justify-center w-8/12 sm:w-full">
                        <FormInput
                          label={
                            <>
                              <i className="fas fa-peso-sign text-base text-[#374151]"></i>{" "}
                              Price
                            </>
                          }
                          name="shirt_price"
                          value={formData.shirt_price}
                          onChange={handleChange}
                          type="text"
                          error={errors.shirt_price}
                          styles="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attendee School Information Part */}
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <FormSelect
                      label="Campus"
                      name="campus"
                      value={user.campus}
                      onChange={handleChange}
                      options={campusOptions}
                      styles="flex-1"
                      disabled
                    />
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
                  <div className="flex flex-row items-center gap-5 py-2 w-full">
                    <div>
                      <FormButton
                        type="submit"
                        text="Add Attendee"
                        styles="w-full hover:bg-[#046c42] bg-[#057a4c] text-white p-2 rounded transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 active:bg-[#045e3b]"
                        onClick={() => handleSubmit()}
                      />
                    </div>
                    <div>
                      <Link to="/admin/dashboard">
                        <button className="w-full hover:bg-[#b00000] bg-[#d00000] text-white p-2 rounded transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 active:bg-[#8f0000]">
                          Cancel
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {useModal && (
        <ConfirmAttendeeModal
          formData={formData}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
        />
      )}

      {/* {useModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className=" bg-white rounded-lg shadow-lg w-full max-w-2xl  relative sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <AiOutlineClose size={24} />
        </button>
        <div className=" p-5 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
          <div className="flex flex-col justify-left gap-2 p-2 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-screen overflow-auto">
            <h2 className="text-xl font-semibold ">Student Attendance</h2>
              <div className="flex flex-col justify-center ml-3">
                <p className="text-gray-800 text-md">Name: {studentData.student}</p>
                <p className="text-gray-800 text-sm">ID: {studentData.id}</p>
                <p className="text-gray-800 text-sm">Course: {studentData.course}</p>
              </div>
            </div>
          </div>
      </div>
    </div>
    )} */}
    </div>
  );
};

export default AddAttendeeForm;
