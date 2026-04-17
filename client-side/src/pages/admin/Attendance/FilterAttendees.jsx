import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const FilterAttendees = ({
  selectedCourses,
  onCourseChange,
  selectedYears,
  onYearChange,
  selectedSchools,
  onSchoolChange,
  selectedSizes,
  onSizeChange,
  selectedStatus,
  onStatusChange,
  onClose,
  onReset,
}) => {
  const sizeOptions = [
    "2XS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
    "18",
  ];
  const courseOptions = ["BSIT", "BSCS"];
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const schoolOptions = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT", "UC-CS"];
  const statusOptions = ["Present", "Absent"];
  const modalRef = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const FilterSection = ({
    title,
    options,
    selectedOptions,
    onChange,
    isColor = false,
  }) => (
    <div className="mb-4">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                selectedOptions.includes(value)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${isColor ? "h-6 w-6 p-0" : ""}`}
              style={isColor ? { backgroundColor: value } : {}}
            >
              {isColor ? "" : label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const handleReset = () => {
    onCourseChange([]);
    onYearChange([]);
    onSchoolChange([]);
    onSizeChange([]);
    onStatusChange("");
    onReset();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-lg"
        ref={modalRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Filter Options</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <FilterSection
          title="Course"
          options={courseOptions}
          selectedOptions={selectedCourses}
          onChange={onCourseChange}
        />

        <FilterSection
          title="Year Level"
          options={yearOptions}
          selectedOptions={selectedYears}
          onChange={onYearChange}
        />

        <FilterSection
          title="School"
          options={schoolOptions}
          selectedOptions={selectedSchools}
          onChange={onSchoolChange}
        />

        <FilterSection
          title="T-Shirt Size"
          options={sizeOptions}
          selectedOptions={selectedSizes}
          onChange={onSizeChange}
        />

        <FilterSection
          title="Status"
          options={statusOptions}
          selectedOptions={selectedStatus}
          onChange={onStatusChange}
        />

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleReset}
            className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterAttendees;
