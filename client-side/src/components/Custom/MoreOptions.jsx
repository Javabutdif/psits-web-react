import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const MoreOptions = () => {
  return (
    <div>
      <button className="text-2xl p-2 focus:outline-none">
        <FontAwesomeIcon icon={faEllipsisH} />
      </button>
    </div>
  );
};

export default MoreOptions;











{/* <ButtonsComponent>
<FormButton
  type="button"
  text="Edit"
  onClick={() => handleEditButtonClick(row)}
  icon={<i className="fas fa-edit" />} // Simple icon
  styles="flex items-center space-x-2 bg-gray-200 text-gray-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
  textClass="text-gray-800" // Elegant text color
  whileHover={{ scale: 1.02, opacity: 0.95 }}
  whileTap={{ scale: 0.98, opacity: 0.9 }}
/>
<FormButton
  type="button"
  text="Delete"
  onClick={() => showModal(row)}
  icon={<i className="fas fa-trash" />} // Simple icon
  styles="flex items-center space-x-2 bg-gray-200 text-red-800 rounded-md px-3 py-1.5 transition duration-150 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
  textClass="text-red-800" // Elegant text color
  whileHover={{ scale: 1.02, opacity: 0.95 }}
  whileTap={{ scale: 0.98, opacity: 0.9 }}
/>
</ButtonsComponent> */}