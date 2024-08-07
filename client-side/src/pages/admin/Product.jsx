import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/alertHelper";
import { addMerchandise } from "../../api/admin";
import { getUser } from "../../authentication/Authentication";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormButton from "../../components/forms/FormButton";
import FormTextArea from "../../components/forms/FormTextArea";
import ImageInput from "../../components/forms/ImageInput";
import { format } from "date-fns";
import { InfinitySpin } from "react-loader-spinner";

function Product({ handleCloseAddProduct }) {
  const [name] = getUser();
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
  ];
  const size = ["18", "XS", "S", "M", "L", "XL", "2XL", "3XL"];
  const [date, setDate] = useState({
    start_date: "",
    end_date: "",
  });
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
    created_by: name,
    control: "",
    selectedSizes: [],
    selectedVariations: [],
  });

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    stocks: "",
    start_date: "",
    end_date: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});

  useEffect(() => {
    // Check if 'Uniform' is present in the formData.type
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setDate({ ...date, [name]: value });
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
  const validate = () => {
    let errors = {};

    // Validate Product Name

    if (formData.name.length === 0) {
      errors.name = "Product Name is required.";
      showToast("error", "Product Name is required.");
    }

    // Validate Price
    if (!formData.price) {
      errors.price = "Price is required.";
      showToast("error", "Price is required.");
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "Price must be a positive number.";
      showToast("error", "Price must be a positive number.");
    }

    // Validate Stocks
    if (formData.stocks.length === 0) {
      errors.stocks = "Stocks must be filled.";
      showToast("error", "Stocks must be filled.");
    } else if (isNaN(formData.stocks) || parseInt(formData.stocks) <= 0) {
      errors.stocks = "Stocks must be a non-negative integer.";
      showToast("error", "Stocks must be a non-negative or zero integer.");
    }

    // Validate Start Date
    if (!formData.start_date) {
      errors.start_date = "Start date is required.";
      showToast("error", "Start date is required.");
    }

    // Validate End Date
    if (!formData.end_date) {
      errors.end_date = "End date is required.";
      showToast("error", "End date is required.");
    } else if (
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      errors.end_date = "End date must be after the start date.";
      showToast("error", "End date must be after the start date.");
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreview = (e) => {
    e.preventDefault();

    if (validate()) {
      const startDate = new Date(date.start_date);
      const endDate = new Date(date.end_date);

      const formattedStartDate = format(startDate, "MMMM d, yyyy h:mm:ss a");
      const formattedEndDate = format(endDate, "MMMM d, yyyy h:mm:ss a");

      const updatedFormData = {
        ...formData,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

   
      setPreviewData(updatedFormData);

      setShowPreview(true);

  
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const data = new FormData();

    // Append all images to FormData
    if (images) {
      images.forEach((image) => data.append("images", image));
    }

    // Append other form data
    for (const key in formData) {
      let value = formData[key];

      // Ensure arrays are converted to strings before appending to FormData
      if (Array.isArray(value)) {
        value = value.join(",");
      }

      data.append(key, value);
    }

    try {
      if (await addMerchandise(data)) {
        showToast("success", "Merchandise Publish");
        handleCloseAddProduct();
        setShowPreview(false);
        setIsLoading(false);
      }
    } catch (error) {
      showToast("error", error.message);
      setIsLoading(false);
    }
  };

  const handleSizeClick = (size) => {
    setFormData((prevState) => {
      // Ensure selectedSizes is treated as an array
      const selectedSizesArray = Array.isArray(prevState.selectedSizes)
        ? prevState.selectedSizes
        : prevState.selectedSizes.split(",");

      const isSelected = selectedSizesArray.includes(size);
      const newSelectedSizes = isSelected
        ? selectedSizesArray.filter((s) => s !== size)
        : [...selectedSizesArray, size];

      return {
        ...prevState,
        selectedSizes: newSelectedSizes,
      };
    });
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
    uniform: [
      { value: "CCS Uniform", label: "CCS Uniform" },
      { value: "Shorts", label: "Shorts" },
      { value: "Jacket", label: "Jacket" },
    ],
    intramurals: [
      { value: "Tshirt", label: "T-shirt" },
      { value: "Ticket", label: "Ticket" },
      { value: "Others", label: "Others" },
    ],
    "ict-congress": [{ value: "Ticket w/ Bundle", label: "Ticket w/ Bundle" }],
    merchandise: [
      { value: "Tshirt", label: "Tshirt" },
      { value: "Item", label: "Item" },
    ],
    acquintance: [
      { value: "Ticket", label: "Ticket" },
      {
        value: "Others",
        label: "Others",
      },
    ],
  };

  const purchaseControlOptions = [
    { value: "limited-purchase", label: "Limited Purchase" },
    { value: "bulk-purchase", label: "Bulk Purchase" },
  ];

  const getTypeOptions = (category) => {
    return typeOptions[category] || [];
  };

  const PreviewModal = ({ data, images, onClose, onConfirm }) => {
    // Show up to 3 images in the preview
    const imagesToShow = images.slice(0, 3);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div className="relative max-w-lg w-full mx-4 md:mx-auto p-6 bg-white rounded-2xl shadow-xl transition-transform transform scale-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preview</h2>
          <div className="space-y-4">
            {imagesToShow.length > 0 && (
              <div className="flex gap-2">
                {imagesToShow.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Product Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200"
                  />
                ))}
                {images.length > 3 && (
                  <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500">
                      +{images.length - 3} more
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="text-gray-700 space-y-1">
              <p className="text-sm">
                <strong>Product Name:</strong> {data.name}
              </p>
              <p className="text-sm">
                <strong>Price:</strong> ₱{data.price}
              </p>
              <p className="text-sm">
                <strong>Stocks:</strong> {data.stocks}
              </p>
              <p className="text-sm">
                <strong>Batch:</strong> {data.batch}
              </p>
              <p className="text-sm">
                <strong>Category:</strong> {data.category}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {data.type}
              </p>
              <p className="text-sm">
                <strong>Description:</strong> {data.description}
              </p>
              <p className="text-sm">
                <strong>Purchase Control:</strong> {data.control}
              </p>
              <p className="text-sm">
                <strong>Start Date:</strong> {data.start_date}
              </p>
              <p className="text-sm">
                <strong>End Date:</strong> {data.end_date}
              </p>
              <p className="text-sm">
                <strong>Sizes:</strong> {data.selectedSizes.join(", ")}
              </p>
              <p className="text-sm">
                <strong>Variations:</strong>{" "}
                {data.selectedVariations.join(", ")}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 text-gray-600 rounded-full text-sm transition-colors hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-500 text-white rounded-full text-sm transition-colors hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative  h-[72%] overflow-y-scroll max-w-md w-full mx-4 md:mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div>
          <button
            onClick={handleCloseAddProduct}
            className="absolute top-6 right-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
          <h2 className="text-xl font-semibold mb-4">Add Product</h2>
          <form onSubmit={handlePreview} className="space-y-4">
            <ImageInput
              label={"Product Image"}
              handleImageChange={handleImageChange}
              multiple={true}
              previews={imagePreviews}
            />
            <FormInput
              label="Product Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              labelStyle="text-xs"
              inputStyle="text-xs"
            />
            <div className="flex flex-col md:flex-row  space-x-0 flex-wrap md:space-x-4 gap-y-4">
              <FormInput
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                labelStyle="text-xs"
                inputStyle="text-xs"
              />
              <FormInput
                label="Stocks"
                name="stocks"
                type="number"
                value={formData.stocks}
                onChange={handleChange}
                labelStyle="text-xs"
                inputStyle="text-xs"
              />
              <FormInput
                label="Batch"
                name="batch"
                type="number"
                value={formData.batch}
                onChange={handleChange}
                labelStyle="text-xs"
                inputStyle="text-xs"
              />
            </div>

            <FormTextArea
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="flex flex-wrap space-x-4 gap-y-4">
              <FormSelect
                name="category"
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={handleChange}
                labelStyle={"text-xs"}
                optionStyle={"text-xs"}
                styles={"flex-1"}
              />
              <FormSelect
                name="type"
                label="Type"
                options={getTypeOptions(formData.category)}
                value={formData.type}
                onChange={handleChange}
                styles={"flex-1"}
                labelStyle={"text-xs"}
                optionStyle={"text-xs"}
              />
            </div>
            <FormSelect
              name="control"
              label="Purchase Control"
              options={purchaseControlOptions}
              value={formData.control}
              onChange={handleChange}
              labelStyle={"text-xs"}
              optionStyle={"text-xs"}
            />
            {(formData.type.split(" ").includes("Uniform") ||
              formData.type.includes("Tshirt")) && (
              <div className="flex flex-wrap gap-y-4 text-xs">
                <div>
                  <p>Sizes:</p>
                  <div className="flex gap-2">
                    {size.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSizeClick(s)}
                        className={`p-2 border rounded ${
                          formData.selectedSizes.includes(s)
                            ? "bg-blue-500 text-white"
                            : ""
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p>Variations:</p>
                  <div className="flex gap-2 flex-wrap text-xs">
                    {variation.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleVariationClick(v)}
                        className={`p-2 border rounded ${
                          formData.selectedVariations.includes(v)
                            ? "bg-blue-500 text-white"
                            : ""
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap space-x-0 md:space-x-4 gap-y-4">
              <FormInput
                label="Start Date"
                name="start_date"
                type="date"
                value={date.start_date}
                onChange={handleChange}
                labelStyle="text-xs"
                inputStyle="text-xs"
                error={errors.start_date} // Pass the error message for start_date
                max={today}
              />
              <FormInput
                label="End Date"
                name="end_date"
                type="date"
                value={date.end_date}
                onChange={handleChange}
                labelStyle="text-xs"
                inputStyle="text-xs"
                error={errors.end_date} // Pass the error message for end_date
                max={today}
              />
            </div>

            <FormButton
              type="button"
              text="Preview"
              onClick={handlePreview}
              styles={"w-full bg-blue-400 p-2 rounded"}
            />
          </form>
          <div>
            {showPreview && (
              <PreviewModal
                data={previewData}
                images={images}
                onClose={() => setShowPreview(false)}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
