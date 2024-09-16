import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FormButton from "../../components/forms/FormButton";
import { makeOrder } from "../../api/orders";
import { getMembershipStatusStudents } from "../../api/students";
import { MdAddShoppingCart } from "react-icons/md";

import {
  getId,
  getRfid,
  getInformationData,
} from "../../authentication/Authentication";
import { getOrder } from "../../api/orders";
import { addToCartApi, viewCart } from "../../api/students";
import ImagePreview from "../../components/Image/ImagePreview";
import { format } from "date-fns";
import { showToast } from "../../utils/alertHelper";

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
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(product.imageUrl?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [cartIndicator, setCartIndicator] = useState(false);
  const [status, setStatus] = useState({ membership: "", renew: "" });
  const [cartLimited, setCartLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    type = "",
  } = product;

  if (position === "N/A") {
    useEffect(() => {
      const fetchStatus = async () => {
        const membershipStatus = await getMembershipStatusStudents(getId());
        setStatus(membershipStatus);
      };
      fetchStatus();
    });
  }
  const [errors, setErrors] = useState({
    selectedSize: "",
    selectedColor: "",
  });
  const statusVerify = () => {
    return (
      ((status.membership === "Accepted" && status.renew === "None") ||
        status.renew === "Accepted" ||
        (status.membership === "Accepted" && status.renew !== "Pending")) &&
      category === "merchandise"
    );
  };

  const validate = () => {
    let errors = {};

    if (selectedSizes[0] !== "" && selectedSize === null) {
      errors.name = "Select size!.";
      showToast("error", "You need to select a size");
    }
    if (
      selectedVariations[0] !== "" &&
      selectedColor === null &&
      category !== "uniform"
    ) {
      errors.name = "Select color!.";
      showToast("error", "You need to select a color");
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const discount =
    ((status.membership === "Accepted" && status.renew === "None") ||
      (status.renew === "Accepted" && category !== "uniform") ||
      status.membership === "Accepted") &&
    category === "merchandise"
      ? price - price * 0.05
      : price;

  const calculateTotal = () => {
    return discount * quantity;
  };

  const calculateDiscount = () => {
    return price * quantity;
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchOrderData = async () => {
      try {
        const orders = await getOrder(getId());
        const carts = await viewCart(getId());
        if (orders) {
          const order = orders.find((order) =>
            order.items.some(
              (item) =>
                item.product_id === _id && control === "limited-purchase"
            )
          );

          if (order) {
            const item = order.items.find(
              (item) =>
                item.product_id === _id && control === "limited-purchase"
            );
            if (item) {
              setOrderId(item.product_id);
              setLimited(true);
            }
          }
        }
        if (carts) {
          const cart = carts.find(
            (cart) => cart.product_id === _id && control === "limited-purchase"
          );
          if (cart) {
            setCartLimited(true);
          }
        }
        setIsLoading(false);
      } catch (error) {
        setError("Unable to fetch order details. Please try again later.");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [_id]);

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

  const handleCart = () => {
    setCartIndicator(true);

    if (validate()) {
      const id_number = getId();
      const product_id = _id;
      const product_name = name;
      const sizes = selectedSize;
      const variation =
        category === "uniform" ? selectedVariations : selectedColor;
      const sub_total = price * quantity;
      const imageUrl1 = imageUrl[0];
      const limited = product.control === "limited-purchase" ? true : false;
      const start_date = product.start_date;
      const end_date = product.end_date;

      setFormData({
        id_number,
        product_id,
        product_name,
        start_date,
        end_date,
        category,
        price,
        sizes,
        variation,
        batch,
        quantity,
        sub_total,
        imageUrl1,
        limited,
      });

      setShowModal(true);
    }
  };

  const handleBuyNow = () => {
    setCartIndicator(false);
    if (validate()) {
      const id_number = getId();
      const rfid = getRfid();
      const imageUrl1 = imageUrl[0];
      const total = calculateTotal();
      const order_date = new Date();
      const order_status = "Pending";
      const membership_discount = statusVerify() ? true : false;

      const items = {
        product_id: _id,
        imageUrl1: imageUrl[0],
        product_name: name,
        limited: product.control === "limited-purchase" ? true : false,
        price: price,
        membership_discount: statusVerify(),
        quantity: quantity,
        sub_total: calculateTotal(),
        variation: category === "uniform" ? selectedVariations : selectedColor,
        sizes: selectedSize,
        batch: batch,
      };

      setFormData({
        id_number,
        rfid,
        imageUrl1,
        course,
        membership_discount,
        year,
        student_name,
        items,
        total,
        order_date,
        order_status,
      });

      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOperation = async (operation, string) => {
    setIsLoading(true);
    try {
      const result = await operation(formData);

      if (result) {
        if (string === "addcart") {
          showToast("success", "Added Item into the cart successfully");
        } else {
          showToast("success", "Order Placed");
        }

        navigate("/student/merchandise");
      } else {
        if (string === "addcart") {
          showToast("error", "Item did not added into the cart");
        } else {
          showToast("error", "The order wasn't placed.");
        }
      }
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = () => {
    handleOperation(makeOrder, "makeorder");
    handleCloseModal();
  };

  const addToCart = () => {
    handleOperation(addToCartApi, "addcart");
    handleCloseModal();
  };

  return (
    <motion.div
      className="mt-4 product-detail bg-white p-3 sm:p-6 mx-auto rounded-lg shadow-sm "
      initial={{ opacity: 0 }}
      z
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FormButton
        styles={
          "flex mb-4 items-center gap-2 px-4 py-2 border rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
        icon={<i className="fa fa-arrow-left"></i>}
        onClick={handleBackButton}
        className="mb-4"
      />

      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col lg:flex-row gap-2">
            <ImagePreview
              preview={preview}
              alt={`Preview of ${name}`}
              className="w-full"
            />
            <ImageGallery
              imageUrl={imageUrl}
              setPreview={setPreview}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-2xl font-bold mb-2">{name}</h3>
            <p className="text-xs text-gray-700 md:text-sm mb-3">
              {description}
            </p>
            <p className="text-md md:text-lg font-semibold text-gray-900 mb-3">
              ₱ {price.toFixed(2)}
            </p>

            <p className="text-xs md:text-sm text-gray-500  mb-2 md:mb-4">
              {batch !== "" ? "Batch: " : ""} {batch}
            </p>

            <p className="text-xs md:text-sm text-gray-500  mb-2 md:mb-4">
              {stocks !== "" ? "Stocks: " : ""} {stocks}
            </p>

            {(type.includes("Tshirt") || type.includes("Uniform")) && (
              <div className="flex flex-wrap gap-4 mb-4">
                <ButtonGroup
                  items={selectedSizes}
                  selectedItem={selectedSize}
                  onSelect={setSelectedSize}
                  label="Sizes"
                />
                <div>
                  <ButtonGroup
                    items={selectedVariations}
                    selectedItem={selectedColor}
                    onSelect={setSelectedColor}
                    label="Color"
                    disabled={category === "uniform"}
                  />
                  <p className="text-xs text-red-500">
                    {type.includes("Uniform")
                      ? "Color set to White and Purple"
                      : ""}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-10 sm:mb-6 relative flexitems-center">
              <span className="mr-2 text-xs sm:text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <button
                className="border text-xs sm:text-sm rounded-full px-4 py-2 mr-2 bg-gray-100 text-gray-700"
                onClick={decreaseQuantity}
                disabled={product.control === "limited-purchase"}
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                className="border text-xs sm:text-sm rounded-full px-4 py-2 ml-2 bg-gray-100 text-gray-700"
                onClick={increaseQuantity}
                disabled={product.control === "limited-purchase"}
              >
                +
              </button>

              {control.toLowerCase().includes("limited") && (
                <div className="absolute -bottom-5 sm:bottom-2 sm:left-48  text-red-500 text-xs sm:text-sm font-medium">
                  Limited Purchase
                </div>
              )}
            </div>

            {formError && (
              <div className="mb-4 text-red-500 text-sm font-medium">
                {formError}
              </div>
            )}
            <div className="flex gap-2">
              {!cartLimited && orderId !== _id && (
                <button
                  onClick={handleCart}
                  className={`flex gap-2 px-4 py-3 font-medium 
            text-white rounded-lg bg-[#4398AC] hover:bg-opacity-80 
              transition-colors duration-300flex-1  ${
                stocks <= 0 || (cartLimited && "cursor-not-allowed")
              } `}
                  disabled={
                    stocks <= 0 ||
                    (product.control === "limited-purchase" &&
                      orderId === _id) ||
                    cartLimited
                  }
                >
                  <MdAddShoppingCart color="white" size={20} />
                  <p className="hidden md:inline-block">Add To Cart</p>
                </button>
              )}

              <button
                className={`flex-1 text-sm w-full px-4 py-3 font-medium rounded-lg transition-colors duration-300 ${
                  stocks <= 0 || limited || cartLimited
                    ? "bg-red-500 text-white"
                    : "bg-[#002E48] text-white"
                } ${
                  stocks <= 0 || cartLimited
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-opacity-80"
                }`}
                aria-label={limited ? "Limited stock" : "Buy Now"}
                title={
                  limited ? "Limited stock available" : "Click to purchase"
                }
                onClick={handleBuyNow}
                disabled={
                  stocks <= 0 || (limited && orderId === _id) || cartLimited
                }
              >
                {stocks <= 0
                  ? "Out of STOCK"
                  : cartLimited
                  ? "Already added to Cart"
                  : limited && orderId === _id
                  ? "Purchased"
                  : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onClose={handleCloseModal}>
        <div className="bg-white p-6 max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {!cartIndicator ? "Confirm Purchase" : "Cart"}
            </h2>
            <div className="mb-4 text-left">
              <p className="mb-2">
                <span className="font-semibold">Name:</span> {name}
              </p>
              <p className="mb-2">
                <span className="font-semibold">
                  {selectedSize !== null ? "Sizes: " : ""}
                </span>{" "}
                {selectedSize}
              </p>
              <p className="mb-2">
                {category === "uniform" && (
                  <>
                    <span className="font-semibold">Color:</span>{" "}
                    {selectedVariations}
                  </>
                )}
                {type !== "Item" &&
                  selectedVariations === null &&
                  category !== "uniform" && (
                    <>
                      <span className="font-semibold">Color:</span>{" "}
                      {selectedColor}
                    </>
                  )}
                {type !== "Item" && category !== "uniform" && (
                  <>
                    <span className="font-semibold">Color:</span>{" "}
                    {selectedColor}
                  </>
                )}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Batch:</span> {batch}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Price:</span> ₱ {price}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Quantity:</span> {quantity}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Membership Discount:</span>
                {statusVerify()
                  ? " ₱" + (calculateDiscount() * 0.05).toFixed(2)
                  : "Not Eligible"}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Total: </span> ₱{" "}
                {calculateTotal()}
              </p>
              <p className="text-gray-700">
                {!cartIndicator
                  ? " Are you sure you want to purchase this item?"
                  : "Add to Cart?"}
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="bg-[#4398AC] hover:bg-opacity-80  px-4 py-2 rounded-md text-white transition-all duration-300 ease-in-out"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-[#002E48] text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-all duration-300 ease-in-out"
                onClick={cartIndicator ? addToCart : handleOrder}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ProductDetail;
