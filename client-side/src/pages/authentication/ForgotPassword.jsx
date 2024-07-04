import React, { useState } from "react";
import backendConnection from "../../api/backendApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormInput from "../../components/forms/FormInput";
import FormButton from "../../components/forms/FormButton";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/email-verification')
    // console.log("Submitted with email:", email);

    // axios
    //   .post(`${backendConnection()}/api/forgot-password`, { email })
    //   .then((res) => {
    //     console.log(res.data.status);
    //     // navigate("/");
    //   });
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const variants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 0.98 },
    whileTap: { scale: 1 }
  };

  const handleNavigate = (pageRoute) => {
    navigate(pageRoute);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="max-w-lg space-y-10 w-full flex flex-col items-center justify-center font-montserrat px-4 lg:px-10 py-10 bg-white shadow-lg rounded-lg">
        <div className="space-y-4 text-center">

          <h3 className="text-xl sm:text-2xl font-bold">Forgot Password</h3>
          <p className="text-sm sm:text-md  sm:max-w-96">Enter the email associated with your account and we’ll send an email with instructions to reset your password.</p>

        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FormInput 
            label="Email Address"
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            styles="w-full text-black p-2 border border-gray-300 rounded"
          />
          <div className="flex space-x-4 justify-between">
            <FormButton 
              type="button" 
              text="Back" 
              styles="w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
              onClick={() => handleNavigate('/login')}
              variants={variants}
              initial="initial"
              animate="animate"
              whileHover="whileHover"
              whileTap="whileTap"
            />
            <FormButton 
              type="submit" 
              onClick={handleSubmit}
              text="Send Email" 
              styles="w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
              variants={variants}
              initial="initial"
              animate="animate"
              whileHover="whileHover"
              whileTap="whileTap"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
