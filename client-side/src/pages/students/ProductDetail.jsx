import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FormButton from "../../components/forms/FormButton";
import { makeOrder } from "../../api/orders";
import { getMembershipStatusStudents } from "../../api/students";
import { MdAddShoppingCart } from "react-icons/md";

import { getInformationData } from "../../authentication/Authentication";
import { getOrder } from "../../api/orders";
import { addToCartApi, viewCart } from "../../api/students";
import ImagePreview from "../../components/Image/ImagePreview";
import { showToast } from "../../utils/alertHelper";

import ImageGallery from "../../components/Image/ImageGallery";

const isObject = (param) => {
  return param !== null && typeof param === "object" && !Array.isArray(param);
};

const ButtonGroup = ({ items, selectedItem, onSelect, label, disabled }) => (
  <div className="mb-2 flex-1">
    <span className="block text-xs md:text-base font-medium text-gray-700">
      {label}
    </span>
    <div className="flex flex-wrap gap-2 mt-1">
      {isObject(items) && Object.keys(items).length > 0 ? (
        Object.entries(items).map(([sizeName]) => (
          <button
            key={sizeName}
            className={`text-xs sm:text-sm md:text-md border rounded-full px-3 py-1 md:px-4 md:py-2 focus:outline-none ${
              selectedItem === sizeName
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onSelect(sizeName)}
            disabled={disabled}
          >
            {sizeName}
          </button>
        ))
      ) : items ? (
        <>
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
        </>
      ) : (
        <span className="text-gray-500">No {label}</span>
      )}
    </div>
  </div>
);

const ProductDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const product = state || {};

  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(product.imageUrl?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [cartIndicator, setCartIndicator] = useState(false);
  const [status, setStatus] = useState({
    status: "",
    isFirstApplication: true,
  });
  const [cartLimited, setCartLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = getInformationData();
  const [price, setPrice] = useState(product.price || 0);
  const {
    _id = "",
    imageUrl = [],
    name = "",
    description = "",

    stocks = 0,
    selectedSizes = [],
    selectedVariations = [],
    control = "",
    category = "",
    batch = "",
    type = "",
  } = product;

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getMembershipStatusStudents(user.id_number);
      setStatus({
        status: status.status,
        isFirstApplication: status.isFirstApplication,
      });
    };
    fetchStatus();
  }, []);

  const [errors, setErrors] = useState({
    selectedSize: "",
    selectedColor: "",
  });
  const statusVerify = () => {
    return (
      (status.status === "ACTIVE" || status.status === "RENEWED") &&
      category === "merchandise"
    );
  };

  const validate = () => {
    let errors = {};

    if (
      selectedSizes[0] !== "" && selectedSize === null && selectedSize
        ? selectedSize.length > 0
        : false
    ) {
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

  const discount = statusVerify() ? price - price * 0.05 : price;

  const calculateTotal = () => {
    return discount * quantity;
  };

  const calculateDiscount = () => {
    return price * quantity;
  };
  useEffect(() => {
    setPrice(
      Number.parseInt(selectedSizes[selectedSize]?.price || product.price || 0)
    );
  }, [selectedSize]);

  useEffect(() => {
    setIsLoading(true);
    const fetchOrderData = async () => {
      try {
        const orders = await getOrder(user.id_number);
        const carts = await viewCart(user.id_number);
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
      const id_number = user.id_number;
      const product_id = _id;
      const sizes = selectedSize;
      const variation =
        category === "uniform" ? selectedVariations : selectedColor;

      setFormData({
        id_number,
        product_id,
        sizes,
        variation,
        quantity,
      });

      setShowModal(true);
    }
  };

  const handleBuyNow = () => {
    setCartIndicator(false);
    if (validate()) {
      const id_number = user.id_number;
      const rfid = user.rfid ? user.rfid : "N/A";
      const course = user.course;
      const year = user.year;
      const student_name = user.name;

      const items = {
        product_id: _id,
        quantity: quantity,
        variation: category === "uniform" ? selectedVariations : selectedColor,
        sizes: selectedSize,
      };

      setFormData({
        id_number,
        rfid,
        course,
        year,
        student_name,
        items,
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
            <p className="text-md md:text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              {statusVerify() && (
                <span className="text-red-600 line-through underline underline-offset-4 decoration-red-600">
                  ₱ {price ? price.toFixed(2) : 0}
                </span>
              )}
              <span>₱ {discount ? discount.toFixed(2) : 0}</span>
            </p>

            <p className="text-xs md:text-sm text-gray-500  mb-2 md:mb-4">
              {batch !== "" ? "Batch: " : ""} {batch}
            </p>
            <p className="text-xs md:text-sm text-gray-500  mb-2 md:mb-4">
              {category !== "" ? "Category: " : ""} {category}
            </p>

            <p className="text-xs md:text-sm text-gray-500  mb-2 md:mb-4">
              {stocks !== "" ? "Stocks: " : ""} {stocks}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              {(type.includes("Tshirt") || type.includes("Uniform")) && (
                <ButtonGroup
                  items={selectedSizes}
                  selectedItem={selectedSize}
                  onSelect={setSelectedSize}
                  label="Sizes"
                />
              )}
              {(type.includes("Tshirt") ||
                type.includes("Uniform") ||
                type.includes("Item")) && (
                <div>
                  <ButtonGroup
                    items={
                      selectedVariations[0] === "" ? [] : selectedVariations
                    }
                    selectedItem={selectedColor}
                    onSelect={setSelectedColor}
                    label="Color"
                    disabled={category === "uniform"}
                  />
                  <p className="text-xs text-red-500">
                    {type.includes("Uniform") &&
                      "Color set to White and Purple"}
                  </p>
                </div>
              )}
            </div>

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

            {/* Buy Now Pop Up Details Modal */}

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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Semi-transparent background */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Container */}
          <div className="bg-white rounded-xl shadow-xl min-w-96 md:min-w-[450px] w-fit z-10 overflow-hidden transform transition-all duration-300 scale-95">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-navy text-white rounded-t-xl shadow-md">
              <h5 className="text-xl font-primary font-bold">
                {cartIndicator ? "Add to Cart?" : "Buy Now?"}
              </h5>
              <button
                type="button"
                className="text-3xl leading-none hover:text-gray-200 focus:outline-none"
                aria-label="Close"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3 bg-gray-50 text-gray-800">
              <div className="flex items-center font-primary font-semibold justify-between gap-10">
                <span className="text-2xl">{name}</span>
              </div>
              {preview && (
                <div className="mb-4 w-full">
                  <img
                    src={preview}
                    alt="Product Preview"
                    className="w-min h-32 rounded-md"
                  />
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center font-secondary justify-between gap-10">
                  <span className="font-medium text-lg">Sizes:</span>
                  <span className="text-lg">
                    {Array.isArray(selectedSize)
                      ? selectedSize.join(", ")
                      : selectedSize}
                  </span>
                </div>
              )}

              <div className="flex items-center font-secondary justify-between gap-10">
                <span className="font-medium text-lg">Color:</span>
                <span className="text-lg">
                  {category === "uniform"
                    ? Array.isArray(selectedVariations)
                      ? selectedVariations.join(", ")
                      : selectedVariations
                    : Array.isArray(selectedColor)
                    ? selectedColor.join(", ")
                    : selectedColor}
                </span>
              </div>

              {batch && (
                <div className="flex items-center font-secondary justify-between gap-10">
                  <span className="font-medium text-lg">Batch:</span>
                  <span className="text-lg">{batch}</span>
                </div>
              )}
              <div className="flex items-center font-secondary justify-between gap-10">
                <span className="font-medium text-lg">Price:</span>
                <span className="text-lg">₱ {price}</span>
              </div>
              <div className="flex items-center font-secondary justify-between gap-10">
                <span className="font-medium text-lg">Quantity:</span>
                <span className="text-lg">{quantity}</span>
              </div>
              <div className="flex items-center font-secondary justify-between gap-10">
                <span className="font-medium text-lg">
                  Membership Discount:
                </span>
                <span className="text-lg">
                  {statusVerify()
                    ? `₱ ${(calculateDiscount() * 0.05).toFixed(2)}`
                    : "Not Eligible"}
                </span>
              </div>
              <div className="flex items-center font-secondary justify-between gap-10">
                <span className="font-medium text-lg">Total:</span>
                <span className="text-lg">₱ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 bg-white border-t border-gray-200 rounded-b-xl">
              <button
                type="button"
                className="px-5 py-2 text-gray-500 hover:text-gray-700 transition-all focus:outline-none rounded-md border border-gray-300 hover:border-gray-400"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ml-3 px-6 py-2 bg-navy text-white rounded-md hover:shadow-lg hover:bg-primary focus:outline-none transition-all duration-300 ease-in-out"
                onClick={cartIndicator ? addToCart : handleOrder}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDetail;
