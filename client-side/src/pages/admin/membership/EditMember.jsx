import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { TailSpin } from "react-loader-spinner";

const EditMember = ({ isVisible, onClose, studentData, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (studentData) {
      setFormData(studentData);
    }
  }, [studentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // To make sure year input is 1-4
    if (name === "year") {
      const numberValue = parseInt(value, 10);
      if (numberValue < 1 || numberValue > 4) {
        return;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check and set RFID value to "N/A" if empty before passing data
    const dataToSave = {
      ...formData,
      rfid: formData.rfid.trim() === "" ? "N/A" : formData.rfid,
    };

    onSave(dataToSave);
    onClose();
  };

  if (!isVisible) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-200 rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <AiOutlineClose size={24} />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Edit Student</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium">ID Number</label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm hover:cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Course</label>
                <select
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                  <option value="ACT">ACT</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">RFID</label>
                <input
                  type="text"
                  name="rfid"
                  value={formData.rfid || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMember;
