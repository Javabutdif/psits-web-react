import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { getOrderDate } from "../../../api/admin";

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
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
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
      <h2 className="text-xl sm:text-xl text-gray-600">
        Daily Product Sales Distribution
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
