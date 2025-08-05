import { useState } from "react";

function AddEvent({ handleClose }) {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDesc: "",
    singleDate: "",
    eventType: "default", // "default" or "whole-day"
    defaultTime: { start: "", end: ""}, 
    wholeDayTimes: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "13:00", end: "17:00" }
    }
  });

  const [errors, setErrors] = useState({
    eventTitle: "",
    eventDesc: "",
    date: "",
    time: "",
    images: "",
    eventType: ""
  });
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle time changes
  const handleTimeChange = (field, value, timeSlot = null) => {
    setFormData((prev) => {
      if (timeSlot) {
        return {
          ...prev,
          wholeDayTimes: {
            ...prev.wholeDayTimes,
            [timeSlot]: { ...prev.wholeDayTimes[timeSlot], [field]: value }
          }
        };
      } else {
        return {
          ...prev,
          defaultTime: { ...prev.defaultTime, [field]: value }
        };
      }
    });
  };

  // // Handle AM/PM selection
  // const handlePeriodChange = (value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     defaultTime: { ...prev.defaultTime, period: value }
  //   }));
  // };

  // Image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.eventTitle) newErrors.eventTitle = "Event title is required";
    if (!formData.singleDate) newErrors.date = "Date is required";

    if (formData.eventType === "default") {
      if (!formData.defaultTime.start || !formData.defaultTime.end) {
        newErrors.time = "Time range is required";
      }
    } else {
      if (!formData.wholeDayTimes.morning.start || !formData.wholeDayTimes.afternoon.end) {
        newErrors.time = "Both time slots are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const eventData = {
        title: formData.eventTitle,
        description: formData.eventDesc,
        type: formData.eventType,
        date: formData.singleDate,
        times:
          formData.eventType === "default"
            ? formData.defaultTime
            : formData.wholeDayTimes,
        images
      };
      console.log("Event data:", eventData);
      alert("Event created successfully!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative max-w-2xl w-full mx-4 p-6 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>

        <h2 className="text-2xl font-semibold mb-6">Add New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Images
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                  <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                errors.eventTitle ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              required
            />
            {errors.eventTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.eventTitle}</p>
            )}
          </div>

          {/* Event Description */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Description
            </label>
            <textarea
              name="eventDesc"
              value={formData.eventDesc}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Event Type Selection */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="eventType"
                  value="default"
                  checked={formData.eventType === "default"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, eventType: "default" }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Default</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="eventType"
                  value="whole-day"
                  checked={formData.eventType === "whole-day"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, eventType: "whole-day" }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Whole Day</span>
              </label>
            </div>
          </div>

          {/* Date Selection */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              name="singleDate"
              value={formData.singleDate}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                errors.date ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="form-group">
            {formData.eventType === "default" ? (
              <>
                {/* AM/PM Selector
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Time Period
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timePeriod"
                        value="AM"
                        checked={formData.defaultTime.period === "AM"}
                        onChange={() => handlePeriodChange("AM")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Morning</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timePeriod"
                        value="PM"
                        checked={formData.defaultTime.period === "PM"}
                        onChange={() => handlePeriodChange("PM")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Afternoon</span>
                    </label>
                  </div>
                </div> */}

                {/* Time Inputs */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="time"
                      value={formData.defaultTime.start}
                      onChange={(e) => handleTimeChange("start", e.target.value)}
                      className={`block w-full px-3 py-2 border ${
                        errors.time ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Start time</p>
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.defaultTime.end}
                      onChange={(e) => handleTimeChange("end", e.target.value)}
                      className={`block w-full px-3 py-2 border ${
                        errors.time ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <p className="text-xs text-gray-500 mt-1">End time</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Morning Slot */}
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Morning</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="time"
                        value={formData.wholeDayTimes.morning.start}
                        onChange={(e) =>
                          handleTimeChange("start", e.target.value, "morning")
                        }
                        className={`block w-full px-3 py-2 border ${
                          errors.time ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Start time</p>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={formData.wholeDayTimes.morning.end}
                        onChange={(e) =>
                          handleTimeChange("end", e.target.value, "morning")
                        }
                        className={`block w-full px-3 py-2 border ${
                          errors.time ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <p className="text-xs text-gray-500 mt-1">End time</p>
                    </div>
                  </div>
                </div>

                {/* Afternoon Slot */}
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Afternoon</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="time"
                        value={formData.wholeDayTimes.afternoon.start}
                        onChange={(e) =>
                          handleTimeChange("start", e.target.value, "afternoon")
                        }
                        className={`block w-full px-3 py-2 border ${
                          errors.time ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Start time</p>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={formData.wholeDayTimes.afternoon.end}
                        onChange={(e) =>
                          handleTimeChange("end", e.target.value, "afternoon")
                        }
                        className={`block w-full px-3 py-2 border ${
                          errors.time ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <p className="text-xs text-gray-500 mt-1">End time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time}</p>
            )}
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
