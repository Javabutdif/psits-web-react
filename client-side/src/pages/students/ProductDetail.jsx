import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FormButton from "../../components/forms/FormButton";
import { makeOrder } from "../../api/orders";

import {
  getId,
  getRfid,
  getInformationData,
} from "../../authentication/Authentication";
import { getOrder } from "../../api/orders";
import ImagePreview from "../../components/Image/ImagePreview";
import { format } from "date-fns";

import ImageGallery from "../../components/Image/ImageGallery";

const ButtonGroup = ({ items, selectedItem, onSelect, label, disabled }) => (
  <div className="mb-2 flex-1">
    <span className="block text-xs md:text-base font-medium text-gray-700">
      {label}
    </span>
    <div className="flex flex-wrap gap-2 mt-1">
      {items.length > 0 ? (
        items.map((item) => (
          <button
            key={item}
            className={`text-xs sm:text-sm   md:text-md border rounded-full px-3 py-1 md:px-4 md:py-2 focus:outline-none ${
              selectedItem === item
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onSelect(item)}
            disabled={disabled}
          >
            {item}
          </button>
        ))
      ) : (
        <span className="text-gray-500">No {label}</span>
      )}
    </div>
  </div>
);

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <div className="flex justify-end">
          <button
            className="text-gray-700 hover:text-gray-900"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};


const ProductDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const product = state || {};

  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [id_number, student_name, email, course, year, role, position] =
  getInformationData();
  

  const [preview, setPreview] = useState(product.imageUrl?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

  console.log(product);

  const {
    _id = "",
    imageUrl = [],
    name = "",
    description = "",
    price = 0,
    stocks = 0,
    selectedSizes = [],
    selectedVariations = [],
    control = "",
    category = "",
    batch = "",
  } = product;

  const discount =
  (status.membership === "Accepted" && status.renew === "None") ||
  (status.renew === "Accepted" && category !== "uniform")
    ? price - price * 0.2
    : price;
    const [formData, setFormData] = useState({});
    const calculateTotal = () => {
      return discount * quantity;
    };
  

  
  const sizes = selectedSizes.length > 0 ? selectedSizes[0].split(",") : [];
  const variations =
    selectedVariations.length > 0 ? selectedVariations[0].split(",") : [];

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const orders = await getOrder(getId());
        const order = orders.find((order) => order.product_id === _id);
        if (order) {
          setOrderId(order.product_id);
          setLimited(order.limited);
        }
      } catch (error) {
        setError("Unable to fetch order details. Please try again later.");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [_id]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-sm">
        <p>{error}</p>
      </div>
    );
  }

  const handleBackButton = () => {
    navigate("/student/merchandise");
  };

  const increaseQuantity = () => {
    if (!limited) {
      setQuantity((prevQuantity) =>
        prevQuantity < stocks ? prevQuantity + 1 : prevQuantity
      );
    }
  };

  const decreaseQuantity = () => {
    if (!limited) {
      setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    }
  };

  const handleBuyNow = () => {
    const id_number = getId();
    const rfid = getRfid();
    const imageUrl1 = imageUrl[0];
    const product_id = _id;
    const product_name = name;
    const sizes = selectedSize;
    const variation =
      category === "uniform" ? selectedVariations : selectedColor;
    const total = calculateTotal();
    const order_date = format(new Date(), "MMMM d, yyyy h:mm:ss a");
    const order_status = "Pending";
    const limited = control === "limited-purchase" ? "True" : "False";
    console.log(formData);
    setFormData({
      id_number,
      rfid,
      imageUrl1,
      course,
      year,
      student_name,
      product_id,
      product_name,
      category,
      sizes,
      variation,
      batch,
      quantity,
      total,
      order_date,
      order_status,
      limited,
    });

    setShowModal(true);
  };


  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOrder = async () => {
    await makeOrder(formData);
    handleCloseModal();
    navigate("/student/merchandise");
  };


  return (
    <motion.div
      className="product-detail p-3 sm:p-6 mx-auto bg-white rounded-lg shadow-sm max-w-5xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FormButton 
        styles={"flex mb-4 items-center gap-2 px-4 py-2 border rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"}
        icon={ <i className="fa fa-arrow-left"></i>}
        onClick={handleBackButton} className="mb-4" />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col md:flex-row gap-5">
          <ImagePreview preview={preview} alt={`Preview of ${name}`} className="w-full" />
          <ImageGallery imageUrl={imageUrl} setPreview={setPreview} className="w-full" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{name}</h3>
          <p className="text-gray-700 text-xs sm:text-sm mb-1 sm:mb-3">{description}</p>
          <p className="text-md sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">${price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-3 sm:mb-4">Batch: {batch}</p>

          {(name.includes("Uniform") || name.includes("Tshirt")) && (
            <div className="flex flex-wrap gap-4 mb-4">
              <ButtonGroup
                items={sizes}
                selectedItem={selectedSize}
                onSelect={setSelectedSize}
                label="Sizes"
              />
              <ButtonGroup
                items={variations}
                selectedItem={selectedColor}
                onSelect={setSelectedColor}
                label="Color"
                disabled={category === "uniform"}
              />
            </div>
          )}

          <div className="mb-10 sm:mb-6 relative flexitems-center">
            <span className="mr-2 text-xs sm:text-sm font-medium text-gray-700">
              Quantity:
            </span>
            <button
              className="border text-xs sm:text-sm rounded-full px-4 py-2 mr-2 bg-gray-100 text-gray-700"
              onClick={decreaseQuantity}
              disabled={limited || control.includes("limited")}
            >
              -
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              className="border text-xs sm:text-sm rounded-full px-4 py-2 ml-2 bg-gray-100 text-gray-700"
              onClick={increaseQuantity}
              disabled={limited || control.toLowerCase().includes("limited")}
            >
              +
            </button>
            { control.toLowerCase().includes("limited") && (
              <div className="absolute -bottom-5 sm:bottom-2 sm:left-48  text-red-500 text-xs sm:text-sm font-medium">
                Limited Purchase
              </div>
            )}
          </div>

          {formError && (
            <div className="mb-4 text-red-500 text-sm font-medium">{formError}</div>
          )}

          <button
            className={`w-full text-sm sm:text-md px-2 py-2 font-medium rounded-lg transition-colors duration-300 ${
              limited ? "bg-red-500 text-white" : "bg-blue-500 text-white"
            } ${stocks <= 0 ? "opacity-60 cursor-not-allowed" : "hover:bg-opacity-80"}`}
            aria-label={limited ? "Limited stock" : "Buy now"}
            title={limited ? "Limited stock available" : "Click to purchase"}
            onClick={handleBuyNow}
            disabled={stocks <= 0 || orderId === _id}
          >
            {stocks <= 0 ? "Out of STOCK" : (limited && orderId === _id ? "Purchased" : "Buy now")}
          </button>
        </div>
      </div>

      <Modal show={showModal} onClose={handleCloseModal}>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Confirm Purchase</h2>
          <p>Product: {name}</p>
          <p>Sizes: {selectedSize}</p>
          <p>
            {category === "uniform"
              ? "Color: " + selectedVariations
              : selectedVariations === null
              ? "Color: " + selectedColor
              : ""}
          </p>
          <p>Batch: {batch}</p>
          <p>Price: ₱ {discount}</p>
          <p>Quantity: {quantity}</p>
          <p>Total: {calculateTotal()}</p>
          <p>Are you sure you want to purchase this item?</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              onClick={handleOrder}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ProductDetail;
