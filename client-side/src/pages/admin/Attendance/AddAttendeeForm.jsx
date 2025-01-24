import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { Link } from "react-router-dom";
import FormButton from "../../../components/forms/FormButton";
import FormInput from "../../../components/forms/FormInput.jsx";



const AddAttendeeForm = () => {
  const [loading, setLoading] = useState(true); 



  // Simulate loading part 
  const fetchData = async () => {
    try {
      setLoading(true); // Start the "loading" state
      
      // Simulate a delay using setTimeout
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 seconds delay
  
      // TODO: Replace this with real data fetching logic
      console.log("Data fetched successfully!");
  
      setLoading(false); // Stop the "loading" state
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false); // Ensure loading stops even if there's an error
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  return(


  <div className="container mx-auto py-4 relative">
    {loading ? (
      <div className="flex justify-center items-center w-full h-full">
        <InfinitySpin
          visible={true}
          width={200}
          color="#0d6efd"
          ariaLabel="infinity-spin-loading"
        />
      </div> ) :(
        <div className="flex justify-center items-center p-2 md:flex-col sm:flex-col ">	
          <motion.div
            className="flex justify-center items-center p-2 md:flex-col sm:flex-col bg-white"
          >
          <div className="flex justify-left p-2">
            <h2 className="text-3xl font-bold">Add Attendee Information</h2>
          </div>		
          <div className="border-black-10">
            <form
              className="flex flex-col gap-5 p-5"
              // onSubmit={showModal}
            >
              {/* Form inputs */}
              <FormInput
                label={"ID Number"}
                type="text"
                id="id_number"
                name="id_number"
                // value={formData.id_number}
                // onChange={handleChange}
                // error={errors.id_number}
                styles="w-full p-2 border border-gray-300 rounded"
              />

              <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
                <FormInput
                  label={"First Name"}
                  type="text"
                  id="first_name"
                  name="first_name"
                  // value={formData.first_name}
                  // onChange={handleChange}
                  // error={errors.first_name}
                  styles="w-full p-2 border border-gray-300 rounded"
                />
                <FormInput
                  label={"Middle Name"}
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  // value={formData.middle_name}
                  // onChange={handleChange}
                  styles="w-full p-2 border border-gray-300 rounded"
                  errorStyles={""}
                  // error={errors.middle_name}
                />
                <FormInput
                  label={"Last Name"}
                  type="text"
                  id="last_name"
                  name="last_name"
                  // value={formData.last_name}
                  // onChange={handleChange}
                  // error={errors.last_name}
                  styles="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              {/* <FormInput
                label={"Email Address"}
                type="text"
                id="email"
                name="email"
                // value={formData.email}
                // onChange={handleChange}
                // error={errors.email}
                styles="w-full p-2 border border-gray-300 rounded"
              /> */}

              <div className="flex justify-between space-x-4">
                {/* <FormSelect
                  label="Course"
                  name="course"
                  // value={formData.course}
                  // onChange={handleChange}
                  // options={courseOptions}
                  // error={errors.course}
                  styles="flex-1"
                />
                <FormSelect
                  label="Year"
                  name="year"
                  // value={formData.year}
                  // onChange={handleChange}
                  // options={yearOptions}
                  // error={errors.year}
                  styles="flex-1"
                /> */}
              </div>
              <div className="flex flex-row gap-10 items-center justify-center p-4">

                <Link to= "/admin/attendance/">
                
                  <FormButton
                    type="submit"
                    text="Confirm"
                    styles="w-full hover:bg-[#074873] bg-[#08568a] text-white p-2 rounded"
                  />
                </Link >
                <Link to= "/admin/attendance">
                
                  <FormButton
                    type="submit"
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