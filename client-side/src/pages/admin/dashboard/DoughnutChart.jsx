import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { getBsit, getBscs, getAct } from "../../../api/admin";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const DoughnutChart = () => {
  const [data, setData] = useState({
    bsit: 0,
    bscs: 0,
    act: 0,
  });

  useEffect(() => {
    const callTotal = async () => {
      try {
        const bsit = await getBsit();
        const bscs = await getBscs();
        const act = await getAct();
        setData({
          bsit,
          bscs,
          act,
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    callTotal();
  }, []);

  const chartData = {
    labels: ["BSIT", "BSCS", "ACT"],
    datasets: [
      {
        label: "Students Registered by Course",
        data: [data.bsit, data.bscs, data.act], // Use dynamic data here
        backgroundColor: [
          "rgba(255, 206, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
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
