import { format } from "date-fns";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Link } from "react-router-dom";
import FormSelect from "../../../components/forms//FormSelect.jsx";
import FormButton from "../../../components/forms/FormButton";
import FormInput from "../../../components/forms/FormInput.jsx";

const AddAttendeeForm = () => {
  const [loading, setLoading] = useState(true); 

// FormData
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    course: "",
    year: "",
    campus: "",
    email: "",
    shirt_size: "",

    applied: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

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
    {value: "UC-Main", label: "UC-MAIN"},
    {value: "UC-BANILAD", label: "UC-BANILAD"},
    {value: "UC-LM", label: "UC-LM"},
    {value: "UC-PT", label: "UC-PT"},
  ]

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


  return(


  <div className="container mx-auto p-6 ">
    {loading ? (
      <div className="flex justify-center items-center w-full h-full">
        <InfinitySpin
          visible={true}
          width={200}
          color="#0d6efd"
          ariaLabel="infinity-spin-loading"
        />
      </div> ) :(
        <div class="flex flex-col gap-5 p-2 md:flex-col sm:flex-col bg-white">	
          <motion.div
            className="flex flex-col justify-center p-2 gap-5"
          >
          <div className="flex w-full px-5 px-2">
            <h2 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal "
            >
              Attendee Information
            </h2>
          </div>		
          <div className="border-black-10">
            <form
              className="flex flex-col w-full space-y-6 p-4  lg:p-5"
              // onSubmit={showModal}
            >
              {/* Form inputs */}
              <div className="flex flex-col justify-center gap-6 sm:gap-4 md:gap-6">
                <FormInput
                  label={"ID Number"}
                  type="text"
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  // error={errors.id_number}
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
                    // error={errors.first_name}
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
                    // error={errors.middle_name}
                  />
                  <FormInput
                    label={"Last Name"}
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    // error={errors.last_name}
                    styles="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="flex flex-col ">
                  <FormInput
                  label={"Email Address"}
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  // error={errors.email}
                  styles="w-full p-2 border border-gray-300 rounded"
                />
                </div>
              </div>



              {/* Attendee School Information Part */}
              <div className="flex flex-col justify-between gap-5 sm:flex-row">
                <FormSelect
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  options={courseOptions}
                  // error={errors.course}
                  styles="flex-1"
                />
                <FormSelect
                  label="Year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  options={yearOptions}
                  // error={errors.year}
                  styles="flex-1"
                />
                <FormSelect
                  label="Campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  options={campusOptions}
                  // error={errors.year}
                  styles="flex-1"
                />
              </div>
              <div className="flex flex-row items-center  py-5 w-full">

                <Link to= "/admin/attendance/">
                
                  <FormButton
                    type="submit"
                    text="Confirm"
                    styles="w-full hover:bg-[#074873] bg-[#08568a] text-white p-2 rounded"
                  />
                </Link >
                <Link to= "/admin/attendance">
                
                  <FormButton
                    type="cancel"
                    text="Cancel"
                    styles="w-full hover:bg-[#074873] bg-[#08568a] text-white p-2 rounded"
                  />
                </Link >

                
              </div>

            </form>

          </div>

          </motion.div>
        </div>


    )}

  </div>




  )

};

export default AddAttendeeForm;