import React from "react";
import { LiaIdCard } from "react-icons/lia";
import { CgProfile } from "react-icons/cg";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoSchoolOutline } from "react-icons/io5";
import { capitalizeWord } from "../../../components/tools/clientTools";

function RegistrationConfirmationModal({ formData, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-xl min-w-96 md:min-w-[450px] w-fit z-10 overflow-hidden transform transition-all duration-300 scale-95">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-navy text-white rounded-t-xl shadow-md">
          <h5 className="text-xl font-primary font-bold">Confirm Details</h5>
          <button
            type="button"
            className="text-3xl leading-none hover:text-gray-200 focus:outline-none"
            onClick={onCancel}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 bg-gray-50 text-gray-800">
          {/* ID Number */}
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center space-x-3">
              <LiaIdCard className="text-xl text-gray-600" size={21} />
              <span className="pt-1 font-medium font-secondary text-lg text-gray-600">
                ID Number:
              </span>
            </div>
            <span className="pt-1 text-gray-900 font-secondary text-lg">
              {formData.id_number}
            </span>
          </div>

          {/* Full Name */}
          <div className="flex items-center justify-between gap-15">
            <div className="flex items-center space-x-3">
              <CgProfile className="text-xl text-gray-600" size={19} />
              <span className="pt-1 font-medium font-secondary text-lg text-gray-600">
                Full Name:
              </span>
            </div>
            <span className="pt-1 text-gray-900 font-secondary text-lg">
              {` ${capitalizeWord(formData.first_name)} ${capitalizeWord(
                formData.middle_name
              )} ${capitalizeWord(formData.last_name)}`}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between gap-15">
            <div className="flex items-center space-x-3">
              <MdOutlineMailOutline
                className="text-xl text-gray-600"
                size={19}
              />
              <span className="pt-1 font-medium font-secondary text-lg text-gray-600">
                Email:
              </span>
            </div>
            <span className="pt-1 text-gray-900 font-secondary text-lg">
              {formData.email}
            </span>
          </div>

          {/* Course & Year */}
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center space-x-3">
              <IoSchoolOutline className="text-xl text-gray-600" size={20} />
              <span className="pt-1 font-medium font-secondary text-lg text-gray-600">
                Course & Year:
              </span>
            </div>
            <span className="pt-1 text-gray-900 font-secondary text-lg">
              {`${formData.course} - ${formData.year}`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 bg-white border-t border-gray-200 rounded-b-xl">
          <button
            type="button"
            className="px-5 py-2 text-gray-500 hover:text-gray-700 transition-all focus:outline-none rounded-md border border-gray-300 hover:border-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ml-3 px-6 py-2 bg-gradient-to-r bg-navy text-white rounded-md hover:shadow-lg hover:from-primary hover:to-navy focus:outline-none transition-all duration-300 ease-in-out"
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
