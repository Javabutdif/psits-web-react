import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/alertHelper";
import { addMerchandise } from "../../api/admin";
import { getInformationData } from "../../authentication/Authentication";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormButton from "../../components/forms/FormButton";
import FormTextArea from "../../components/forms/FormTextArea";
import ImageInput from "../../components/forms/ImageInput";
import { format } from "date-fns";
import { InfinitySpin } from "react-loader-spinner";
import ToggleSwitch from "../../components/common/ToggleSwitch";

function Product({ handleCloseAddProduct }) {
  const user = getInformationData();
  const today = new Date().toISOString().split("T")[0];
  const [isLoading, setIsLoading] = useState(false);
  const variation = [
    "White",
    "Purple",
    "Black",
    "Red",
    "Yellow",
    "Orange",
    "Blue",
    "Green",
    "Pink",
    "Gray",
    "Brown",
    "Cyan",
    "Magenta",
    "Teal",
    "Maroon",
    "Innovatio",
    "Paradox",
    "BSIT Wave",
  ];
  const size = [
    "18",
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
  ];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stocks: "",
    batch: "",
    description: "",
    start_date: "",
    end_date: "",
    category: "",
    type: "",
    created_by: user.name,
    control: "",
    selectedSizes: [],
    selectedVariations: [],
    selectedAudience: "",

    eventDate: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    stocks: "",
    start_date: "",
    end_date: "",
    category: "",
    type: "",
    control: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [isShown, setIsShown] = useState(false);
  const [isVariation, setVariation] = useState(false);

  const [isEventType, setIsEventType] = useState(false);

  const toggleIsEventType = () => {
    setIsEventType((prev) => !prev);
  };

  useEffect(() => {
    if (
      formData.type.includes("Uniform") ||
      formData.type.includes("Tshirt") ||
      formData.type.includes("Tshirt w/ Bundle")
    ) {
      setIsShown(true);
    } else if (formData.type.includes("Item")) {
      setVariation(true);
    } else {
      setIsShown(false);
      setVariation(false);
    }
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      showToast("error", "You can only upload up to 3 images");
      return;
    }

    setImages((prevImages) => [...prevImages, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      return updatedImages;
    });

    setImagePreviews((prevPreviews) => {
      const updatedPreviews = prevPreviews.filter((_, i) => i !== index);
      return updatedPreviews;
    });
  };

  const validate = () => {
    let errors = {};

    if (formData.name.length === 0) {
      errors.name = "Product Name is required.";
      showToast("error", errors.name);
    }
    if (formData.control.length === 0) {
      errors.control = "Product Control is required.";
      showToast("error", errors.control);
    }
    if (formData.type.length === 0) {
      errors.type = "Product Type is required.";
      showToast("error", errors.type);
    }

    if (!formData.price) {
      errors.price = "Price is required.";
      showToast("error", errors.price);
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "Price must be a positive number.";
      showToast("error", errors.price);
    }

    if (formData.stocks.length === 0) {
      errors.stocks = "Stocks must be filled.";
      showToast("error", errors.stocks);
    } else if (isNaN(formData.stocks) || parseInt(formData.stocks) <= 0) {
      errors.stocks = "Stocks must be a non-negative integer.";
      showToast("error", errors.stocks);
    }
    if (formData.category === "") {
      errors.category = "Category must filled up";
      showToast("error", errors.category);
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required.";
      showToast("error", errors.start_date);
    }

    if (!formData.end_date) {
      errors.end_date = "End date is required.";
      showToast("error", errors.end_date);
    } else if (
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      errors.end_date = "End date must be after the start date.";
      showToast("error", errors.end_date);
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreview = (e) => {
    console.log(formData);
    e.preventDefault();
    if (validate()) {
      setPreviewData(formData);
      setShowPreview(true);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const data = new FormData();

    if (images) {
      images.forEach((image) => data.append("images", image));
    }

    for (const key in formData) {
      let value = formData[key];

      if (key === "selectedSizes") {
        try {
          value = JSON.stringify(value);
        } catch (error) {
          console.error("Error stringifying selectedSizes:", value);
          return;
        }
      } else if (key === "sessionConfig") {
        // Handle sessionConfig object
        try {
          value = JSON.stringify(value);
        } catch (error) {
          console.error("Error stringifying sessionConfig:", value);
          return;
        }
      } else if (Array.isArray(value)) {
        value = value.join(",");
      }

      data.append(key, value);
    }

    data.append("isEvent", isEventType);

    console.log("FormData contents:");
    data.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      if (await addMerchandise(data)) {
        showToast("success", "Merchandise Published");
        handleCloseAddProduct();
        setShowPreview(false);
        setIsLoading(false);
      }
    } catch (error) {
      showToast("error", error.message);
      setShowPreview(false);
      setIsLoading(false);
    }
  };
  const handleSizeClick = (size) => {
    setFormData((prevState) => {
      const selectedSizes = prevState.selectedSizes || {};

      // Toggle size selection
      if (selectedSizes.hasOwnProperty(size)) {
        const updatedSizes = { ...selectedSizes };
        delete updatedSizes[size];
        return { ...prevState, selectedSizes: updatedSizes };
      }

      return {
        ...prevState,
        selectedSizes: {
          ...selectedSizes,
          [size]: { custom: false, price: formData.price },
        },
      };
    });
  };

  const handleCustomPriceToggle = (size) => {
    setFormData((prevState) => ({
      ...prevState,
      selectedSizes: {
        ...prevState.selectedSizes,
        [size]: {
          ...prevState.selectedSizes[size],
          custom: !prevState.selectedSizes[size].custom,
          price: !prevState.selectedSizes[size].custom ? "" : formData.price, // Reset price if unchecked
        },
      },
    }));
  };

  const handlePriceChange = (size, value) => {
    setFormData((prevState) => ({
      ...prevState,
      selectedSizes: {
        ...prevState.selectedSizes,
        [size]: { ...prevState.selectedSizes[size], price: value },
      },
    }));
  };

  const handleVariationClick = (variation) => {
    setFormData((prevState) => {
      const selectedVariationsArray = Array.isArray(
        prevState.selectedVariations
      )
        ? prevState.selectedVariations
        : prevState.selectedVariations.split(",");

      const isSelected = selectedVariationsArray.includes(variation);
      const newSelectedVariations = isSelected
        ? selectedVariationsArray.filter((v) => v !== variation)
        : [...selectedVariationsArray, variation];

      return {
        ...prevState,
        selectedVariations: newSelectedVariations,
      };
    });
  };

  const categoryOptions = [
    { value: "uniform", label: "Uniform" },
    { value: "intramurals", label: "Intramurals" },
    { value: "ict-congress", label: "ICT Congress" },
    { value: "merchandise", label: "Merchandise" },
    { value: "acquintance", label: "Acquintance" },
  ];

  const typeOptions = {
    uniform: [{ value: "Uniform", label: "Uniform" }],
    intramurals: [
      { value: "Tshirt", label: "T-shirt" },
      { value: "Ticket", label: "Ticket" },
      { value: "Others", label: "Others" },
    ],
    "ict-congress": [{ value: "Tshirt w/ Bundle", label: "Tshirt w/ Bundle" }],
    merchandise: [
      { value: "Tshirt", label: "Tshirt" },
      { value: "Item", label: "Item" },
    ],
    acquintance: [
      { value: "Ticket w/ Bundle", label: "Ticket w/ Bundle" },
      { value: "Others", label: "Others" },
    ],
  };

  const purchaseControlOptions = [
    { value: "limited-purchase", label: "Limited Purchase" },
    { value: "bulk-purchase", label: "Bulk Purchase" },
  ];
  const audience = [
    { value: "all", label: "All" },
    { value: "officers", label: "Officers" },
    {
      value: "volunteer,media,developer",
      label: "Volunteers, Media and Developers",
    },
  ];

  const getTypeOptions = (category) => {
    return typeOptions[category] || [];
  };

  const handleTimeChange = (session, startTime, endTime) => {
    const timeRange = `${startTime} - ${endTime}`;
    setFormData((prev) => ({
      ...prev,
      sessionConfig: {
        ...prev.sessionConfig,
        [`${session}Time`]: timeRange,
      },
    }));
  };

  const parseTimeRange = (timeRange) => {
    if (!timeRange) return { start: "", end: "" };
    const [start, end] = timeRange.split(" - ");
    return { start: start || "", end: end || "" };
  };

  // Handle session configuration changes
  const handleSessionChange = (session, field, value) => {
    // Create the correct field name: is + Session + Enabled
    const fieldName = `is${
      session.charAt(0).toUpperCase() + session.slice(1)
    }${field}`;
    console.log(`Setting ${fieldName} to ${value}`); // Debug log

    setFormData((prev) => {
      const newSessionConfig = { ...prev.sessionConfig };
      newSessionConfig[fieldName] = value;

      // Remove any duplicate fields that might exist
      delete newSessionConfig[`${session}${field}`];

      return {
        ...prev,
        sessionConfig: newSessionConfig,
      };
    });
  };

  const PreviewModal = ({ data, images, onClose, onConfirm, isLoading }) => {
    const imagesToShow = images.slice(0, 3);

    return (
      <div>
        {/** Semi-transparent background */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

          {/** Modal Container */}
          <div className="z-10 w-fit min-w-96 scale-95 transform overflow-hidden rounded-xl bg-white shadow-xl transition-all duration-300 md:min-w-[450px]">
            {/** Header */}
            <div className="flex items-center justify-between rounded-t-xl bg-navy p-6 text-white shadow-md">
              <h5 className="font-primary text-xl font-bold">Preview</h5>
              <button
                type="button"
                className="text-3xl leading-none hover:text-gray-200 focus:outline-none"
                aria-label="Close"
                onClick={onClose}
              >
                &times;
              </button>
            </div>

            {/** Body */}
            <div className="space-y-3 bg-gray-50 p-6 text-gray-800">
              {imagesToShow.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto">
                  {imagesToShow.map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`Product Preview ${index + 1}`}
                      className="h-20 w-20 rounded-md border border-gray-200 object-cover shadow-sm"
                    />
                  ))}
                  {images.length > 3 && (
                    <div className="flex h-20 w-20 items-center justify-center rounded-md border border-gray-200 bg-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500">
                        +{images.length - 3} more
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1 text-gray-700">
                {Object.entries({
                  "Product Name": data.name,
                  Price: `₱${data.price}`,
                  Stocks: data.stocks,
                  Batch: data.batch,
                  Category: data.category,
                  Type: data.type,
                  Description: data.description,
                  "Purchase Control": data.control,
                  "Start Date": data.start_date,
                  "End Date": data.end_date,
                  Sizes: Object.entries(data.selectedSizes), // Keep it as an array
                  Variations: data.selectedVariations,
                }).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-10"
                  >
                    <span className="text-md font-medium">{label}:</span>

                    {/* Handle array values separately */}
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-2">
                        {value.map(([size, details]) => (
                          <div
                            key={size}
                            className="flex items-center gap-1 rounded border p-1"
                          >
                            <span>{size}</span>
                            {details.custom && (
                              <span className="text-sm text-gray-500">
                                ₱{details.price}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-md">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/** Footer */}
            <div className="flex items-center justify-end rounded-b-xl border-t border-gray-200 bg-white p-6">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-5 py-2 text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ml-3 rounded-md bg-navy px-6 py-2 text-white transition-all duration-300 ease-in-out hover:bg-primary hover:shadow-lg focus:outline-none"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="relative flex items-center">
                    <div className="dot-container">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <style jsx>{`
                      .dot-container {
                        display: flex;
                        justify-content: space-between;
                        width: 50px;
                        height: 20px;
                      }
                      .dot {
                        width: 8px;
                        height: 8px;
                        background-color: white;
                        border-radius: 50%;
                        animation: bounce 1s infinite;
                      }
                      .dot:nth-child(2) {
                        animation-delay: 0.2s;
                      }
                      .dot:nth-child(3) {
                        animation-delay: 0.4s;
                      }
                      @keyframes bounce {
                        0%,
                        100% {
                          transform: translateY(10px);
                        }
                        50% {
                          transform: translateY(-8px);
                        }
                      }
                    `}</style>
                  </div>
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="loader"></div>
          <p className="ml-4 text-white">Uploading product, please wait...</p>
        </div>
      ) : (
        <div className="relative mx-4 h-[90%] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg md:mx-8">
          <button
            onClick={handleCloseAddProduct}
            className="absolute right-4 top-4 text-gray-600 transition-colors hover:text-gray-900"
          >
            <i className="fas fa-times"></i>
          </button>
          <h2 className="mb-4 text-2xl font-semibold">Add Product</h2>

          <form onSubmit={handlePreview} className="space-y-6">
            <ImageInput
              label={"Product Image"}
              handleImageChange={handleImageChange}
              multiple={true}
              previews={imagePreviews}
              onRemoveImage={handleRemoveImage}
            />
            <FormInput
              label="Product Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              labelStyle="text-sm"
              inputStyle="text-sm"
            />
            <div className="flex flex-col gap-4 md:flex-row">
              <FormInput
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                labelStyle="text-sm"
                inputStyle="text-sm"
              />
              <FormInput
                label="Stocks"
                name="stocks"
                type="number"
                value={formData.stocks}
                onChange={handleChange}
                labelStyle="text-sm"
                inputStyle="text-sm"
              />
              <FormInput
                label="Batch"
                name="batch"
                type="number"
                value={formData.batch}
                onChange={handleChange}
                labelStyle="text-sm"
                inputStyle="text-sm"
              />
            </div>
            <FormTextArea
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              labelStyle="text-sm"
              inputStyle="text-sm"
            />
            <div className="flex flex-col gap-4 md:flex-row">
              <FormSelect
                name="category"
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={handleChange}
                labelStyle="text-sm"
                optionStyle="text-sm"
                styles="flex-1"
              />
              <FormSelect
                name="type"
                label="Type"
                options={getTypeOptions(formData.category)}
                value={formData.type}
                onChange={handleChange}
                styles="flex-1"
                labelStyle="text-sm"
                optionStyle="text-sm"
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex flex-row gap-4">
                <label
                  htmlFor="start_date"
                  className="mb-1 text-sm text-gray-500"
                >
                  Is Merch of Event type?
                </label>
                <ToggleSwitch
                  isToggled={isEventType}
                  onToggle={toggleIsEventType}
                />
              </div>
            </div>
            {isEventType && (
              <>
                <div className="relative flex flex-col">
                  <label htmlFor="eventDate" className="mb-1 text-gray-500">
                    Event Date
                  </label>
                  <FormInput
                    label=""
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleChange}
                    labelStyle="text-sm"
                    inputStyle="text-sm"
                    error={errors.eventDate}
                    max={today}
                  />
                </div>

                {/* Session Configuration */}
                <div className="form-group">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Session Configuration
                  </label>

                  {/* Morning Session */}
                  <div className="mb-4 rounded-lg border p-4">
                    <div className="mb-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.sessionConfig?.isMorningEnabled || false
                        }
                        onChange={(e) =>
                          handleSessionChange(
                            "morning",
                            "Enabled",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm font-medium">
                        Morning Session
                      </label>
                    </div>
                    {formData.sessionConfig?.isMorningEnabled && (
                      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.morningTime ||
                                  "08:00-12:00"
                              ).start
                            }
                            onChange={(e) => {
                              const endTime = parseTimeRange(
                                formData.sessionConfig.morningTime ||
                                  "08:00-12:00"
                              ).end;
                              handleTimeChange(
                                "morning",
                                e.target.value,
                                endTime
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Start time
                          </p>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.morningTime ||
                                  "08:00-12:00"
                              ).end
                            }
                            onChange={(e) => {
                              const startTime = parseTimeRange(
                                formData.sessionConfig.morningTime ||
                                  "08:00-12:00"
                              ).start;
                              handleTimeChange(
                                "morning",
                                startTime,
                                e.target.value
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">End time</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Afternoon Session */}
                  <div className="mb-4 rounded-lg border p-4">
                    <div className="mb-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.sessionConfig?.isAfternoonEnabled || false
                        }
                        onChange={(e) =>
                          handleSessionChange(
                            "afternoon",
                            "Enabled",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm font-medium">
                        Afternoon Session
                      </label>
                    </div>
                    {formData.sessionConfig?.isAfternoonEnabled && (
                      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.afternoonTime ||
                                  "13:00-17:00"
                              ).start
                            }
                            onChange={(e) => {
                              const endTime = parseTimeRange(
                                formData.sessionConfig.afternoonTime ||
                                  "13:00-17:00"
                              ).end;
                              handleTimeChange(
                                "afternoon",
                                e.target.value,
                                endTime
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Start time
                          </p>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.afternoonTime ||
                                  "13:00-17:00"
                              ).end
                            }
                            onChange={(e) => {
                              const startTime = parseTimeRange(
                                formData.sessionConfig.afternoonTime ||
                                  "13:00-17:00"
                              ).start;
                              handleTimeChange(
                                "afternoon",
                                startTime,
                                e.target.value
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">End time</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Evening Session */}
                  <div className="mb-4 rounded-lg border p-4">
                    <div className="mb-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.sessionConfig?.isEveningEnabled || false
                        }
                        onChange={(e) =>
                          handleSessionChange(
                            "evening",
                            "Enabled",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm font-medium">
                        Evening Session
                      </label>
                    </div>
                    {formData.sessionConfig?.isEveningEnabled && (
                      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.eveningTime ||
                                  "18:00-22:00"
                              ).start
                            }
                            onChange={(e) => {
                              const endTime = parseTimeRange(
                                formData.sessionConfig.eveningTime ||
                                  "18:00-22:00"
                              ).end;
                              handleTimeChange(
                                "evening",
                                e.target.value,
                                endTime
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Start time
                          </p>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={
                              parseTimeRange(
                                formData.sessionConfig.eveningTime ||
                                  "18:00-22:00"
                              ).end
                            }
                            onChange={(e) => {
                              const startTime = parseTimeRange(
                                formData.sessionConfig.eveningTime ||
                                  "18:00-22:00"
                              ).start;
                              handleTimeChange(
                                "evening",
                                startTime,
                                e.target.value
                              );
                            }}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">End time</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {errors.sessions && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sessions}
                    </p>
                  )}
                </div>
              </>
            )}

            <FormSelect
              name="control"
              label="Purchase Control"
              options={purchaseControlOptions}
              value={formData.control}
              onChange={handleChange}
              labelStyle="text-sm"
              optionStyle="text-sm"
            />
            <FormSelect
              name="selectedAudience"
              label="Select Audience"
              options={audience}
              value={formData.selectedAudience}
              onChange={handleChange}
              labelStyle="text-sm"
              optionStyle="text-sm"
            />

            <div className="flex flex-col gap-4 text-sm">
              {isShown && (
                <div>
                  <p className="font-semibold">Sizes:</p>
                  <div className="flex flex-col gap-2">
                    {size.map((s) => (
                      <div
                        key={s}
                        className="grid grid-cols-[auto_auto_1fr] items-center gap-4"
                      >
                        {/* Button for Size Selection */}
                        <button
                          type="button"
                          onClick={() => handleSizeClick(s)}
                          className={`w-14 rounded border p-2 text-center ${
                            formData.selectedSizes[s]
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          {s}
                        </button>

                        {/* Checkbox for Custom Price */}
                        {formData.selectedSizes[s] !== undefined && (
                          <label className="flex items-center gap-2 text-sm">
                            <FormInput
                              type="checkbox"
                              checked={
                                formData.selectedSizes[s]?.custom || false
                              }
                              onChange={() => handleCustomPriceToggle(s)}
                            />
                            Custom Price
                          </label>
                        )}

                        {/* Input for Custom Price */}
                        {formData.selectedSizes[s]?.custom && (
                          <FormInput
                            type="number"
                            placeholder="Enter price"
                            value={
                              formData.selectedSizes[s]?.price
                                ? formData.selectedSizes[s]?.price
                                : formData.price
                            }
                            onChange={(e) =>
                              handlePriceChange(s, e.target.value)
                            }
                            className="w-full max-w-32 rounded border p-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(isShown || isVariation) && (
                <div>
                  <p className="font-semibold">Variations:</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {variation.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleVariationClick(v)}
                        className={`rounded border p-2 ${
                          formData.selectedVariations.includes(v)
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex flex-col">
                <label htmlFor="start_date" className="mb-1 text-gray-500">
                  Start Date
                </label>
                <FormInput
                  label=""
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  labelStyle="text-sm"
                  inputStyle="text-sm"
                  error={errors.start_date}
                  max={today}
                />
              </div>
              <div className="relative flex flex-col">
                <label htmlFor="end_date" className="mb-1 text-gray-500">
                  End Date
                </label>
                <FormInput
                  label=""
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  labelStyle="text-sm"
                  inputStyle="text-sm"
                  error={errors.end_date}
                  max={today}
                />
              </div>
            </div>

            <FormButton
              type="button"
              text="Preview"
              onClick={handlePreview}
              styles="w-full bg-[#002E48] p-2 rounded text-white"
            />
          </form>
          {showPreview && (
            <PreviewModal
              data={previewData}
              images={images}
              onClose={() => setShowPreview(false)}
              onConfirm={handleConfirm}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Product;
