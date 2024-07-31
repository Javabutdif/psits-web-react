import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

function ProductDetail() {
  const { state } = useLocation();
  const { _id } = useParams();
  const product = state;

  console.log(state);

  // Ensure product is defined before accessing its properties
  const sizes =
    product && product.selectedSizes && product.selectedSizes.length > 0
      ? product.selectedSizes[0].split(",")
      : [];
  const variations =
    product &&
    product.selectedVariations &&
    product.selectedVariations.length > 0
      ? product.selectedVariations[0].split(",")
      : [];

  if (!product) {
    return <div>Loading...</div>; // or handle the case when product data is not available
  }

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 w-full">
          <img
            className="w-full h-auto object-cover"
            src={product.imageUrl[0]}
            alt={product.title}
          />
        </div>

        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">₱{product.price.toFixed(2)}</p>
          <p className="text-gray-700 mb-4">In stock: {product.stocks}</p>
          <div className="mb-4">
            <span className="mr-2">Sizes:</span>
            <div className="inline-flex">
              {sizes.length > 0 ? (
                sizes.map((size) => (
                  <button
                    key={size}
                    className={`border rounded-full px-4 py-2 mr-2 mb-2 focus:outline-none ${
                      selectedSize === size ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span>No Sizes</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <span className="mr-2">Color:</span>
            <div className="inline-flex">
              {variations.map((variants) => (
                <button
                  key={variants}
                  className="border rounded-full px-4 py-2 mr-2 mb-2 focus:outline-none"
                >
                  {variants}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <span className="mr-2">Quantity:</span>
            <button
              className="border rounded-full px-4 py-2 mr-2"
              onClick={decreaseQuantity}
              disabled={product.control === "Limited Purchase"}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              className="border rounded-full px-4 py-2 ml-2"
              onClick={increaseQuantity}
              disabled={product.control === "Limited Purchase"}
            >
              +
            </button>
            <div>
              <span className="text-red-500">
                {product.control === "Limited Purchase"
                  ? "Limited Purchase"
                  : ""}
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Add to Cart
            </button>
            <button className="bg-green-500 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Product Specification</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Product Specification Details */}
          <div>
            <p>Category: {product.category}</p>
            <p>Sizes: {product.selectedSizes.join(", ")}</p>
            <p>Material: {product.material}</p>
            <p>Length: {product.length}</p>
            <p>Weight: {product.weight}</p>
            <p>Brand: {product.brand}</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Product Description</h2>
        <p>{product.description}</p>
      </div>
    </div>
  );
}

export default ProductDetail;
