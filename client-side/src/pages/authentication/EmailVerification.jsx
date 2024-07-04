import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormButton from '../../components/forms/FormButton';

const EmailVerification = () => {
  const navigate = useNavigate();

  const handleResendEmail = () => {
    // Logic to resend email
    console.log('Resend email logic');
  };

  const handleChangeEmail = () => {
    navigate('/forgot-password');
  };

  const handleProceed = () => {
    navigate('/otp-verifier');
  };


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4 font-montserrat">
      <div className='max-w-lg space-y-10 w-full flex text-center flex-col items-center justify-center font-montserrat px-4 sn :px-8 py-10 bg-white shadow-lg rounded-lg'>
        <div className="space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-bold">CHECK YOUR EMAIL</h3>
        <p className='text-sm  sm:max-w-96  '>
          We have sent you an email at <strong>HEHE@Gmail.com</strong>.
          Check your inbox and follow the instructions to reset your account password.
        </p>
      </div>
      <div className='text-sm sm:text-md flex items-center'>
            <p>Did not recieve the mail? </p>
            <FormButton 
              type="button" 
              onClick={handleResendEmail}
              text="Resend Email" 
              styles="text-sm p-2 rounded"
              // variants={variants}
              initial="initial"
              animate="animate"
              whileHover="whileHover"
              whileTap="whileTap"
            />    
          </div>
        <div className='space-x-4 flex text-md uppercase justify-center sm:items-center w-full'>
            <FormButton 
              type="button" 
              onClick={handleChangeEmail}
              text="back" 
              styles="flex-1 capitalize bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
              // variants={variants}
              initial="initial"
              animate="animate"
              whileHover="whileHover"
              whileTap="whileTap"
            />  
          <FormButton 
            type="button" 
            onClick={handleProceed}
            text="Proceed" 
            styles="flex-1 bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
            // variants={variants}
            initial="initial"
            animate="animate"
            whileHover="whileHover"
            whileTap="whileTap"
          />  
        </div>  
        
      </div>
    </div>
  );
};

export default EmailVerification;
