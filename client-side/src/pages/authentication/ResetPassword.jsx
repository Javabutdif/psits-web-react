import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormButton from '../../components/forms/FormButton';
import FormInput from '../../components/forms/FormInput';

const NewPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password and confirmPassword here
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    // Placeholder logic for setting new password
    // Replace with actual API call or logic to set new password
    console.log('Setting new password:', password);

    // Example navigation to login page on successful password reset
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">

      <div className="max-w-lg space-y-10 w-full flex flex-col items-center justify-center font-montserrat px-4 lg:px-10 py-10 bg-white shadow-lg rounded-lg">
        <div className="space-y-4 text-center">
          <h3 className='text-xl sm:text-2xl font-bold'>Forgot Password</h3>
          <p className='text-sm sm:text-md  sm:max-w-96'>Enter the email associated with your account and we’ll send an email with instructions to reset your password.</p>

        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FormInput 
            label="Password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChangePassword}
            styles="w-full text-black p-2 border border-gray-300 rounded"
          /> 
          <FormInput 
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChangeConfirmPassword}
            styles="w-full text-black p-2 border border-gray-300 rounded"
          />
          <FormButton 
            type="submit" 

            text="Reset New Password" 
            styles="text-sm  sm:text-md w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"

          />
        </form>
      </div>
    </div>
  );
};

export default NewPasswordForm;
