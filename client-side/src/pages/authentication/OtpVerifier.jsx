import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/forms/FormInput';
import FormButton from '../../components/forms/FormButton';

const OTPVerifier = ({ email }) => {
  const [otp, setOTP] = useState(['', '', '', '', '', '']); // Array to hold OTP digits
  const navigate = useNavigate();
  const refs = useRef([]); // Ref to store input refs

  const handleChange = (index, value) => {
    if (!isNaN(value) && value.length <= 1) { // Limit to single digit input
      const newOTP = [...otp];
      newOTP[index] = value;

      setOTP(newOTP);

      // Move focus to next input if available
      if (index < otp.length - 1 && refs.current[index + 1]) {
        refs.current[index + 1].focus();
      }
    } else if (value === '') {
      const newOTP = [...otp];
      newOTP[index] = '';

      setOTP(newOTP);

      // Move focus to previous input if deleting and current input is empty
      if (index > 0 && refs.current[index - 1]) {
        refs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const enteredOTP = otp.join(''); // Join array into a single string

    // Example logic: navigate to success page if OTP is correct
    if (enteredOTP === '123456') { // Replace with your actual verification logic
      navigate('/reset-password'); // Navigate to reset password page on success
    } else {
      alert('Invalid OTP. Please try again.'); // Replace with actual error handling
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4 font-montserrat">

      <div className='max-w-lg space-y-10 w-full flex text-center flex-col items-center justify-center font-montserrat px-4 sm:px-8 py-10 bg-white shadow-lg rounded-lg'>
        <div className='space-y-3'>
          <h3 className='text-xl sm:text-2xl font-bold'>Verify your OTP code</h3>
          <p className='text-sm sm:text-md  sm:max-w-96'>An 6-digit code has been sent to 

            <span className='block'>
              <strong>{email}</strong>
            </span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-10'>
          <div className='flex gap-2'>
            {otp.map((digit, index) => (
              <FormInput
                key={index}
                type="text"
                maxLength={1} // Limit input to one character
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                ref={(input) => (refs.current[index] = input)} // Assign ref to input

                styles="w-full p-2 text-sm sm:text-md text-black  border border-gray-300 rounded"

              />
            ))}
          </div>
          <FormButton
            type="submit"
            text={"Verify"}
            onClick={handleVerifyOTP}
            styles="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </form>
      </div>
    </div>
  );
};

export default OTPVerifier;
