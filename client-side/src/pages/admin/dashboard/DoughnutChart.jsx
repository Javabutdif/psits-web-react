import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const DoughnutChart = () => {
  // Static data for the chart
  const chartData = {
    labels: ['Course A', 'Course B', 'Course C', 'Course D', 'Course E', 'Course F'],
    datasets: [
      {
        label: 'Students Registered by Course',
        data: [120, 150, 180, 90, 60, 30], // Static values
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (context.parsed) {
              label += `: ${context.parsed}`;
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div>
      <h2>Course Registration Distribution</h2>
      <Doughnut data={chartData} options={options}  />
    </div>
  );
};

export default DoughnutChart;
