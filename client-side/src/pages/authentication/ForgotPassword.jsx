import React, { useState } from "react";
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/forms/FormInput";
import FormButton from "../../components/forms/FormButton";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Email is invalid.")
      return
    }
    // You can add the API call here if needed
    navigate('/email-verification');
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Reset error on change
  };

  const variants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 0.98 },
    whileTap: { scale: 1 },
  };

  const handleNavigate = (pageRoute) => {
    navigate(pageRoute);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="max-w-lg space-y-10 w-full flex flex-col items-center justify-center px-4 lg:px-10 py-10 bg-white shadow-lg rounded-lg">
        <div className="space-y-4 text-center">
          <h3 className="text-xl sm:text-2xl font-bold">Forgot Password</h3>
          <p className="text-sm sm:text-md sm:max-w-96">
            Enter the email associated with your account, and we’ll send you instructions to reset your password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FormInput 
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            styles="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            error={error}
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
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
