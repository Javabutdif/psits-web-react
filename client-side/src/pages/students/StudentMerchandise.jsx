import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { merchandise } from "../../api/admin";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/student/merchandise/${product._id}`, {
      state: { product },
    });
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-4">
      <div className="h-64 w-full overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={product.imageUrl}
          alt={product.title}
        />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{product.name}</div>
        <p className="text-gray-700 text-base">₱{product.price.toFixed(2)}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button
          className={`${
            product.isBought ? "bg-red-500" : "bg-blue-500"
          } text-white font-bold py-2 px-4 rounded-full`}
          onClick={handleViewDetails}
          disabled={product.isBought}
        >
          {product.isBought ? "Already Bought" : "View Details"}
        </button>
      </div>
    </div>
  );
};

function StudentMerchandise() {
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    try {
      const result = await merchandise();
      setProducts(result); // Assuming result is an array of products
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border rounded py-2 px-4 w-1/3"
        />
        <div className="flex space-x-4">
          <select className="border rounded py-2 px-4">
            <option>Category</option>
          </select>
          <select className="border rounded py-2 px-4">
            <option>Sort by</option>
          </select>
          <select className="border rounded py-2 px-4">
            <option>Price Range</option>
          </select>
        </div>
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
          View Cart
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default StudentMerchandise;
