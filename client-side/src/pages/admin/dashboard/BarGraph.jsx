import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { React, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { getDashboardStats } from "../../../api/admin";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BarGraph = () => {
  const [year, setYear] = useState({
    year1: 0,
    year2: 0,
    year3: 0,
    year4: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const callTotal = async () => {
      try {
        const response = await getDashboardStats();
        const {
          years: { year1, year2, year3, year4 },
        } = response;

        setYear({
          year1,
          year2,
          year3,
          year4,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };

    callTotal();
  }, []);

  const total = year.year1 + year.year2 + year.year3 + year.year4;
  const colors = [
    "rgba(54, 162, 235, 0.7)", // Freshmen
    "rgba(255, 206, 86, 0.7)", // Sophomore
    "rgba(75, 192, 192, 0.7)", // Junior
    "rgba(153, 102, 255, 0.7)", // Senior
  ];

  const hoverColors = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
  ];

  const borderColors = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
  ];

  const data = {
    labels: ["Freshmen", "Sophomore", "Junior", "Senior"],
    datasets: [
      {
        label: "Year 1",
        data: [year.year1, 0, 0, 0],
        backgroundColor: colors[0],
        borderColor: borderColors[0],
        borderWidth: 2,
        hoverBackgroundColor: hoverColors[0],
        hoverBorderWidth: 3,
        borderRadius: 6,
      },
      {
        label: "Year 2",
        data: [0, year.year2, 0, 0],
        backgroundColor: colors[1],
        borderColor: borderColors[1],
        borderWidth: 2,
        hoverBackgroundColor: hoverColors[1],
        hoverBorderWidth: 3,
        borderRadius: 6,
      },
      {
        label: "Year 3",
        data: [0, 0, year.year3, 0],
        backgroundColor: colors[2],
        borderColor: borderColors[2],
        borderWidth: 2,
        hoverBackgroundColor: hoverColors[2],
        hoverBorderWidth: 3,
        borderRadius: 6,
      },
      {
        label: "Year 4",
        data: [0, 0, 0, year.year4],
        backgroundColor: colors[3],
        borderColor: borderColors[3],
        borderWidth: 2,
        hoverBackgroundColor: hoverColors[3],
        hoverBorderWidth: 3,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.dataIndex * 300;
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            family: 'Arial',
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
          footer: (context) => {
            return `Total: ${total}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        displayColors: true,
        usePointStyle: true,
      },
      datalabels: {
        display: false // We'll show them conditionally below
      },
      subtitle: {
        display: true,
        text: `Total Students: ${total}`,
        position: 'bottom',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1
        }
      },
    },
    elements: {
      bar: {
        borderSkipped: 'bottom',
      }
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl text-center sm:text-2xl text-[#074873] font-bold mb-4">
        Student Count by Year Level
      </h2>
      <div className="relative h-80 max-lg:w-full max-md:w-full max-sm:w-72 ">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
            <Bar 
            data={data} 
            options={options}
            plugins={[{
              id: 'customCenterLabel',
              afterDatasetsDraw(chart) {
                if (total === 0) return;
                
                const { ctx, chartArea: { top, bottom, left, right } } = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#074873';
                ctx.textAlign = 'center';
                // ctx.fillText(`Total: ${total}`, centerX, centerY);
                ctx.restore();
              }
            }]}
          />
        )}
      </div>
    </div>
  );
};

export default BarGraph;