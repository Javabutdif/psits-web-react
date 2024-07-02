import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backendConnection from "../../api/backendApi";
import { showToast } from "../../utils/alertHelper";
import {
  setAuthentication,
  attemptAuthentication,
  getAttemptAuthentication,
  resetAttemptAuthentication,
  getTimeout,
} from "../../authentication/localStorage";
import { InfinitySpin } from "react-loader-spinner";
import logo from '../../assets/images/login.png';
import FormButton from '../../components/forms/FormButton';
import FormInput from '../../components/forms/FormInput';

const Login = () => {
  const [formData, setFormData] = useState({
    id_number: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (getAttemptAuthentication() < 3 && getTimeout() === null) {
        const response = await fetch(`${backendConnection()}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();

        if (response.ok && (data.role === "Admin" || data.role === "Student")) {
          showToast("success", "Signed in successfully");
          setAuthentication(data.name, data.id_number, data.role, data.position);
          resetAttemptAuthentication();
          navigate(`/${data.role.toLowerCase()}Dashboard`);
        } else {
          showToast("error", data);
          attemptAuthentication();
        }
      } else {
        showToast(
          "error",
          "Maximum login attempts reached. Please wait 1 minute before trying again!"
        );
        getTimeout();
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const handleNavigate = (pageRoute) => () => {
    navigate(pageRoute);
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.97 }
  };

  const loginButtonVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 0.98 },
    whileTap: { scale: 1 }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-60vh">
          <InfinitySpin 
                visible={true}
                width={200}
                color="#0d6efd"
                ariaLabel="infinity-spin-loading"
   
          />
        </div>
      ) : (
        <div className="w-full max-w-lg flex flex-col items-center justify-center font-montserrat bg-white shadow-lg rounded-lg">
          <img src={logo} alt="Logo" className="" />
          <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full p-4 sm:p-8">
            <h3 className="text-2xl font-bold text-center mb-4">Welcome Back!</h3>
            <FormInput
              label="ID Number"
              type="text"
              id="id-number"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />
            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              styles="w-full p-2 border border-gray-300 rounded"
            />

            <FormButton
              type="button"
              text="Forgot Password?"
              onClick={handleNavigate('/forgot-password')}
              styles="text-xs self-end text-blue-500 hover:underline mb-4"
              variants={buttonVariants}
            />

            <FormButton
              type="submit"
              text="Login"
              styles="w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
              variants={loginButtonVariants}
            />

            <div className="mt-4 text-center">
              <p className="text-gray-600">Don't have an account?</p>
              <FormButton
                type="button"
                text="Sign Up"
                onClick={handleNavigate("/register")}
                styles="text-xs m-2"
                variants={buttonVariants}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
