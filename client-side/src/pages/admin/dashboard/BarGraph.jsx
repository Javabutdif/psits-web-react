import { React, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getYear1, getYear2, getYear3, getYear4 } from "../../../api/admin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarGraph = () => {
  const [year, setYear] = useState({
    year1: 0,
    year2: 0,
    year3: 0,
    year4: 0,
  });

  useEffect(() => {
    const callTotal = async () => {
      try {
        const year1 = await getYear1();
        const year2 = await getYear2();
        const year3 = await getYear3();
        const year4 = await getYear4();
        setYear({
          year1,
          year2,
          year3,
          year4,
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    callTotal();
  }, []);

 
  const colors = [
    "rgba(75, 192, 192, 0.2)", 
    "rgba(255, 99, 132, 0.2)", 
    "rgba(255, 159, 64, 0.2)", 
    "rgba(153, 102, 255, 0.2)", 
  ];

  const borderColors = [
    "rgba(75, 192, 192, 1)",
    "rgba(255, 99, 132, 1)", 
    "rgba(255, 159, 64, 1)", 
    "rgba(153, 102, 255, 1)", 
  ];

  const data = {
    labels: ["Freshmen", "Sophomore", "Junior", "Senior"],
    datasets: [
      {
        label: "1",
        data: [year.year1, 0, 0, 0], // Set only Year 1 data
        backgroundColor: colors[0],
        borderColor: borderColors[0],
        borderWidth: 1,
      },
      {
        label: "2",
        data: [0, year.year2, 0, 0], 
        backgroundColor: colors[1],
        borderColor: borderColors[1],
        borderWidth: 1,
      },
      {
        label: "3",
        data: [0, 0, year.year3, 0], 
        backgroundColor: colors[2],
        borderColor: borderColors[2],
        borderWidth: 1,
      },
      {
        label: "4",
        data: [0, 0, 0, year.year4], 
        backgroundColor: colors[3],
        borderColor: borderColors[3],
        borderWidth: 1,
      },
    ],
  };

 
  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-96 p-4">
      {" "}
      {/* Ensure full width and height, with padding */}
      <h2 className="text-xl sm:text-2xl text-gray-600 mb-4">Year Level</h2>
      <div className="w-full h-60">
        {" "}
        {/* Container for the chart */}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarGraph;
