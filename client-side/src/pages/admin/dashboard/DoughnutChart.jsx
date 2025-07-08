import { getDashboardStats } from "../../../api/admin";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { InfinitySpin } from "react-loader-spinner";

// Register ChartJS components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DoughnutChart = () => {
  const [data, setData] = useState({
    BSIT: 0,
    BSCS: 0,
  });
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };

    callTotal();
  }, []);

  const total = data.BSIT + data.BSCS;
  
  const chartData = {
    labels: ["BSIT", "BSCS"],
    datasets: [
      {
        label: "Students Registered by Course",
        data: [data.BSIT, data.BSCS],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)", // BSIT
          "rgba(255, 99, 132, 0.7)", // BSCS
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)", 
          "rgba(255, 99, 132, 1)"
        ],
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverBackgroundColor: [
          "rgba(54, 162, 235, 0.9)",
          "rgba(255, 99, 132, 0.9)"
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            family: 'Arial',
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        bodyFont: {
          size: 14,
          weight: 'bold'
        },
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 16
        },
        footerFont: {
          size: 12
        }
      }
    },
    elements: {
      arc: {
        borderRadius: 10,
        borderJoinStyle: 'round'
      }
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl text-[#074873] font-bold mb-4">
        Student Count per Course
      </h2>
      <div className="relative h-80 max-lg:w-full max-md:w-full max-sm:w-72 ">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <InfinitySpin width="200" color="#3B82F6" />
          </div>
        ) : (
            <Doughnut 
            data={chartData} 
            options={options}
            plugins={[{
              id: 'centerLabel',
              beforeDraw(chart) {
                // Get ctx from chart
                const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
                
                // Calculate center position
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                
                ctx.save();
                
                // Draw total count
                ctx.font = 'bold 30px Arial';
                ctx.fillStyle = '#074873';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(total.toString(), centerX, centerY - 15);
                
                // Draw "Total Students" label
                ctx.font = '15px Arial';
                ctx.fillStyle = '#666';
                ctx.fillText('Total Students', centerX, centerY + 15);
                
                ctx.restore();
              }
            }]}
          />
        )}
      </div>
    </div>
  );
};

export default DoughnutChart;