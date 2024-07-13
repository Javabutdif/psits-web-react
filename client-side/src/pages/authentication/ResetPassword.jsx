import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormButton from '../../components/forms/FormButton';
import FormInput from '../../components/forms/FormInput';

const NewPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    setError(''); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) { 
      setError('Password must be at least 6 characters long.');
      return;
    }

    console.log('Setting new password:', password);

    navigate('/login');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="max-w-lg space-y-10 w-full flex flex-col items-center justify-center px-4 lg:px-10 py-10 bg-white shadow-lg rounded-lg">
        <div className="space-y-4 text-center">
          <h3 className='text-xl sm:text-2xl font-bold'>Reset Your Password</h3>
          <p className='text-sm sm:text-md sm:max-w-96'>Please enter a new password and confirm it.</p>
          {error && <p className="text-red-500">{error}</p>} 
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <FormInput 
            label="Password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            styles="w-full text-black p-2 border border-gray-300 rounded"
          /> 
          <FormInput 
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            styles="w-full text-black p-2 border border-gray-300 rounded"
          />
          <FormButton 
            type="submit" 
            text="Reset New Password" 
            styles="text-sm sm:text-md w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded"
          />
        </form>
      </div>
    </div>
  );
};

export default NewPasswordForm;
