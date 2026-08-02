import { login } from "../../api/index";
import ai from "../../assets/images/AI.png";
import logo from "../../assets/images/login.png";
import valen from "../../assets/images/valen.png";

import {
  attemptAuthentication,
  resetAttemptAuthentication,
  getTimeout,
  getAttemptAuthentication,
  getRoute,
} from "../../authentication/Authentication";
import FormButton from "../../components/forms/FormButton";
import FormInput from "../../components/forms/FormInput";
import { showToast } from "../../utils/alertHelper";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { GiPumpkin } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import { InfinitySpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [remainingTime, setRemainingTime] = useState();
  const currentDate = new Date();
  const janStart = new Date(currentDate.getFullYear(), 1, 10);
  const janEnd = new Date(currentDate.getFullYear(), 11, 30);

  useEffect(() => {
    let interval;
    if (remainingTime !== null) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [remainingTime]);

  const [formData, setFormData] = useState({
    id_number: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateInputs = () => {
    const newErrors = {};
    const idNumberRegex = /^\d{8}(-admin)?$/;

    if (!formData.id_number) {
      newErrors.id_number = "ID Number is required.";
    } else if (!idNumberRegex.test(formData.id_number)) {
      newErrors.id_number = "ID Number must be 8 digits.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      if (getAttemptAuthentication() < 3 && getTimeout() === null) {
        const data = await login(formData);
        console.log(data);
        if (data) {
          if (
            data.role === "Admin" ||
            data.role === "Student" ||
            data.role === "ADMIN"
          ) {
            resetAttemptAuthentication();

            showToast("success", data.message);
            if (data.campus !== "UC-Main" && data.role === "Admin") {
              window.location.href = `/${data.role.toLowerCase()}/events`;
            } else {
              setTimeout(() => {
                window.location.href = `/${data.role.toLowerCase()}/dashboard`;
              }, 1000);
            }
          } else {
            attemptAuthentication();
            setRemainingTime(60);
          }
        } else {
          attemptAuthentication();
          setRemainingTime(60);
        }
      } else {
        showToast(
          "error",
          `Maximum login attempts reached. Please wait ${remainingTime} seconds before trying again!`
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      showToast("error", "An unexpected error occurred. Please try again.");
    } finally {
      getTimeout();
      setIsLoading(false);
    }
  };

  const handleNavigate = (pageRoute) => () => {
    navigate(pageRoute);
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.97 },
  };

  const loginButtonVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 0.98 },
    whileTap: { scale: 1 },
  };

  if (getRoute() !== null) {
    navigate(`/${getRoute().toLowerCase()}/dashboard`);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {isLoading ? (
        <div className="h-60vh flex items-center justify-center">
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
          className="flex w-full max-w-lg flex-col items-center justify-center rounded-lg bg-white shadow-lg"
        >
          <button
            type="button"
            onClick={handleNavigate("/")}
            className="absolute left-4 top-4 transform bg-opacity-0 text-white transition duration-300 ease-in-out hover:scale-105"
          >
            <IoArrowBack size={35} color="#074873" />
          </button>
          <img
            src={currentDate >= janStart && currentDate <= janEnd ? ai : logo}
            alt="Logo"
            className=""
          />
          <form
            onSubmit={handleLogin}
            className="flex w-full flex-col space-y-5 p-5"
          >
            <h3 className="mb-4 text-center text-xl font-bold sm:text-2xl">
              Welcome Back!
            </h3>
            <div className="space-y-6">
              <FormInput
                label="ID Number"
                type="text"
                id="id-number"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                styles="w-full p-2 border border-gray-300 rounded"
                error={errors.id_number}
              />
              <FormInput
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                styles="w-full p-2 border border-gray-300 rounded"
                error={errors.password}
              />
            </div>

            <FormButton
              type="button"
              text="Forgot Password?"
              onClick={handleNavigate("/forgot-password")}
              styles="text-xs self-end text-[#08568a] hover:underline mb-4"
              variants={buttonVariants}
            />

            <FormButton
              type="submit"
              text="Login"
              styles="w-full bg-[#08568a] hover:bg-[#074873] text-white p-2 rounded"
              variants={loginButtonVariants}
            />

            <div className="sm:text-md flex items-center justify-center text-sm">
              <p className="text-gray-600">Don't have an account?</p>
              <FormButton
                type="button"
                text="Sign Up"
                onClick={handleNavigate("/register")}
                styles="text-xs m-2 text-blue-500 underline"
                variants={buttonVariants}
              />
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
