import React, { useState } from "react";
import { getId } from "../../../authentication/Authentication";
import { requestMembership } from "../../../api/students";

function Membership() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = getId();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const request = async () => {
    try {
      await requestMembership(id);
      toggleModal(); // Close the modal after the request is successful
    } catch (error) {
      console.error("Error requesting membership:", error);
    }
  };

  return (
    <div className="bg-blue-500 p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl text-white font-bold mb-4">
        Join Our Membership Program
      </h1>
      <p className="text-white text-lg mb-6">
        Get exclusive benefits and stay updated with our latest offers.
      </p>
      <button
        className="bg-white text-blue-500 font-semibold px-6 py-2 rounded hover:bg-gray-100 transition"
        onClick={toggleModal}
      >
        Get Membership
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Request Membership</h2>
            <p className="text-lg mb-6">
              Are you sure you want to request membership?
            </p>
            <button
              className="bg-blue-500 text-white font-semibold px-6 py-2 rounded hover:bg-blue-600 transition"
              onClick={request}
            >
              Yes
            </button>
            <button
              className="ml-4 bg-gray-500 text-white font-semibold px-6 py-2 rounded hover:bg-gray-600 transition"
              onClick={toggleModal}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Membership;
