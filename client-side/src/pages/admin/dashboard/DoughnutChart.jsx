import { getDashboardStats } from "../../../api/admin";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const DoughnutChart = () => {
  const [data, setData] = useState({
    BSIT: 0,
    BSCS: 0,
  });

  useEffect(() => {
    const callTotal = async () => {
      try {
        const response = await getDashboardStats();
        const {
          courses: { BSIT, BSCS },
        } = response;
        setData({
          BSIT,
          BSCS,
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    callTotal();
  }, []);
  const chartData = {
    labels: ["BSIT", "BSCS"],
    datasets: [
      {
        label: "Students Registered by Course",
        data: [data.BSIT, data.BSCS],
        backgroundColor: ["rgba(156, 163, 175, 1)", "rgba(156, 163, 175, 0.7)"],
        borderColor: ["rgba(75, 85, 99, 1)", "rgba(75, 85, 99, 1)"],
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
            let label = context.label || "";
            if (context.parsed) {
              label += `: ${context.parsed}`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-xl text-gray-600">
        Student Count per Course
      </h2>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
