import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Statistics = () => {
  const studentYearsData = {
    labels: ['1st Years', '2nd Years', '3rd Years', '4th Years'],
    datasets: [
      {
        data: [70, 30, 20, 15],
        backgroundColor: [
          'rgba(137, 121, 255, 1)',
          'rgba(255, 146, 138, 1)',
          'rgba(60, 195, 223, 1)',
          'rgba(255, 174, 76, 1)',
        ],
        borderColor: [
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const campusData = {
    labels: ['UC-Main', 'UC-Banilad', 'UC-LM', 'UC-PT'],
    datasets: [
      {
        label: 'Students',
        data: [8.4, 4.0, 2.7, 2.3, 1.7],
        backgroundColor: 'rgba(137, 121, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const courseData = {
    labels: ['IT Students', 'CS Students'],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: [
          'rgba(137, 121, 255, 1)',
          'rgba(255, 146, 138, 1)',
        ],
        borderColor: [
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOption1 = {
    responsive: true,
    maintainAspectRatio: false, // Ensures the chart fills its container
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  const chartOption2 = {
    responsive: true,
    maintainAspectRatio: false, // Ensures the chart fills its container
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Population Statistics</h1>

      <div className="flex flex-col items-center p-6">
        <div className="flex flex-col gap-8 w-full items-center">
          <div className="w-full md:w-[60%] lg:w-[50%] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <Pie data={studentYearsData} options={chartOption2} />
          </div>

          <div className="w-full md:w-[60%] lg:w-[50%] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-4 shadow-md rounded-lg">
            <Bar data={campusData} options={chartOption1} />
          </div>

          <div className="w-full md:w-[60%] lg:w-[50%] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-4 shadow-md rounded-lg">
            <Pie data={courseData} options={chartOption2} />
          </div>

          <div className="w-[300px] bg-[#D9D9D9]  text-center p-5 rounded-lg">
            <p>Total number of Attendees</p>
            <h3>7000</h3>
          </div>
          <div className="w-[300px] bg-[#D9D9D9] mb-8 text-center p-5 rounded-lg">
            <p>We value your feedback.</p>
            <p> Please enter your evaluation below.</p>
          <input type="text" />
          </div>
        </div>
      </div>
    </div>

  );
};

export default Statistics;
