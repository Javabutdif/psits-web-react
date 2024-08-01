import React, { useState } from "react";
import { getId } from "../../../authentication/Authentication";
import { requestMembership } from "../../../api/students";

function Membership() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const id = getId();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const request = async () => {
    try {
      await requestMembership(id);
      setIsRequested(true);
      toggleModal();
    } catch (error) {
      console.error("Error requesting membership:", error);
    }
  };

  const handleClose = () => {
    setIsRequested(false);
    window.location.reload();
  };

  return (
    <div className="w-full self-start relative overflow-hidden bg-blue-500 p-4 md:p-8 rounded-lg shadow-lg text-center">
      <div className="relative z-30">
        <h1 className="text-xl md:text-3xl text-white font-bold mb-4">
          Join Our Membership Program
        </h1>
        <p className="text-white text-sm md:text-lg mb-6">
          Get exclusive benefits and stay updated with our latest offers.
        </p>
        <button
          className="bg-white text-sm px-4 text-blue-500 font-semibold md:px-6 py-2 rounded hover:bg-gray-100 transition"
          onClick={toggleModal}
        >
          Get Membership
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center w-full max-w-md mx-auto border border-gray-200">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Request Membership
            </h2>
            <p className="text-lg mb-4 text-gray-600">
              Are you sure you want to request membership? Please note that you
              need to pay PHP 50 in the PSITS Office to activate your membership
              until the end of the semester.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-300">
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                Membership Benefits:
              </h3>
              <ul className="list-disc list-inside text-left text-gray-600">
                <li className="mb-2">20% discount on all merchandise</li>
                <li>Clearance offers at the end of the semester</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition ease-in-out"
                onClick={request}
              >
                Yes
              </button>
              <button
                className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-gray-700 transition ease-in-out"
                onClick={toggleModal}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {isRequested && (
        <div className="fixed inset-0 flex items-center justify-center bg-green-500 bg-opacity-75 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md mx-auto border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Membership Requested
            </h2>
            <p className="text-lg mb-4 text-gray-600">
              Your membership request has been successfully submitted!
            </p>
            <button
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition ease-in-out"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Membership;
