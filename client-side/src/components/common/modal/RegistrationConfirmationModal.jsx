import React from "react";

function RegistrationConfirmationModal({ formData, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-30"></div>
      <div className="bg-white rounded-lg shadow-md max-w-md w-full z-10 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h5 className="text-lg font-semibold">Confirm Your Details</h5>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onCancel}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2">
          {[
            { label: "ID Number", value: formData.id_number },
            { label: "First Name", value: formData.first_name },
            { label: "Middle Name", value: formData.middle_name },
            { label: "Last Name", value: formData.last_name },
            { label: "Email", value: formData.email },
            { label: "Course", value: formData.course },
            { label: "Year", value: formData.year },
          ].map((item, index) => (
            <p key={index} className="text-sm text-gray-700">
              <strong>{item.label}:</strong> {item.value}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-300">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ml-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={onSubmit}
           
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrationConfirmationModal;
