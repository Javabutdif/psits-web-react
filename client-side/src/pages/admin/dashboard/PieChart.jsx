import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { getOrderDate } from "../../../api/admin"; // Replace with your actual data fetching function

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = () => {
  const [data, setData] = useState({
    products: [],
    orders: [],
    subtotal: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOrderDate();
        const orders = result.map((item) => item.numberOfOrders);
        const products = result.map((item) => item.product_name);
        const subtotal = result.map((item) => item.totalSubtotal);
        setData({
          products,
          orders,
          subtotal,
        });
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
      
            const label = context.label || "";
            const value = context.raw;
            const subtotal = data.subtotal[index];
          
            return `${label}: ${value} \nSubtotal: ₱${subtotal}`;
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
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
