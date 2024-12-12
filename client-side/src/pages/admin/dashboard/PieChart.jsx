import { getOrderDate } from "../../../api/admin";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export const formatString = (str, abbreviate = true) => {
  if (!str || typeof str !== "string") {
    return "Unknown";
  }

  const words = str.split(" ");
  let formattedString = "";

  if (abbreviate) {
    for (let i = 0; i < words.length - 1; i++) {
      formattedString += words[i].charAt(0) + ".";
    }
    formattedString += " " + words[words.length - 1];
  } else {
    formattedString = str;
  }

  return formattedString;
};

const PieChart = () => {
  const [data, setData] = useState({
    products: [],
    orders: [],
    subtotal: [],
    quantity: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOrderDate();

        if (Array.isArray(result)) {
          const orders = result.map((item) => item.totalQuantity);
          const products = result.map((item) => item.product_name);
          const subtotal = result.map((item) => item.totalSubtotal);
          const quantity = result.map((item) => item.totalQuantity);

          setData({
            products,
            orders,
            subtotal,
            quantity,
          });
        } else {
          console.error("Unexpected data format", result);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.products,
    datasets: [
      {
        label: "Number of Orders by Product",
        data: data.orders,
        backgroundColor: [
          "rgba(209, 213, 219, 0.7)",
          "rgba(156, 163, 175, 0.7)",
          "rgba(107, 114, 128, 0.7)",
          "rgba(75, 85, 99, 0.7)",
          "rgba(55, 65, 81, 0.7)",
        ],
        borderColor: [
          "rgba(209, 213, 219, 1)",
          "rgba(156, 163, 175, 1)",
          "rgba(107, 114, 128, 1)",
          "rgba(75, 85, 99, 1)",
          "rgba(55, 65, 81, 1)",
        ],

        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const label = formatString(context.label) || "";
            const subtotal = data.subtotal[index] || 0;
            const quantity = data.quantity[index] || 0;
            return `${label}: ${quantity} \nSubtotal: ₱${subtotal}`;
          },
        },
      },
    },
  };

  return (
    <div className="text-center">
      <h2 className="text-sm sm:text-xl text-gray-600">
        Daily Sales Distribution
      </h2>
      {data.products.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default PieChart;
