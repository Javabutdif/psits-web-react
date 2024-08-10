import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FormButton from "../../components/forms/FormButton";
import backendConnection from "../../api/backendApi";
import axios from "axios";
import { showToast } from "../../utils/alertHelper";

const EmailVerification = () => {
  const navigate = useNavigate();
  const email = window.location.pathname.split("/").pop();

  const handleResendEmail = () => {
    axios
      .post(`${backendConnection()}/api/student/forgot-password`, {
        email: email,
      })
      .then((res) => {
        showToast("success", "Email sent successfully!");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            showToast("error", "Email not found!");
          } else {
            showToast("error", "Server Error!");
          }
        } else if (error.request) {
          // The request was made but no response was received
          showToast("error", "No response received from server.");
        } else {
          // Something happened in setting up the request that triggered an Error
          showToast("error", "Request setup error!");
        }
      });
  };

  const handleChangeEmail = () => {
    navigate("/forgot-password");
  };

  const handleProceed = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 space-y-8 flex flex-col items-center"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-center">
          CHECK YOUR EMAIL
        </h3>
        <p className="text-sm sm:max-w-md text-center">
          We have sent you an email at <strong>{email}</strong>. Check your
          inbox and <strong>click the link on the email</strong> to reset your
          account password.
        </p>
        <div className="flex items-center text-sm">
          <p>Did not receive the mail? </p>
          <FormButton
            type="button"
            onClick={handleResendEmail}
            text="Resend Email"
            styles="text-sm p-2 rounded ml-2"
          />
        </div>
        <div className="flex space-x-4 w-full">
          <FormButton
            type="button"
            onClick={handleChangeEmail}
            text="Back"
            styles="flex-1 capitalize bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
          />
          <FormButton
            type="button"
            onClick={handleProceed}
            text="Proceed"
            styles="flex-1 bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
