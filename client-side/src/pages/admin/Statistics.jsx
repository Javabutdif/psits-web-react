import { React, useEffect, useState } from "react";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import { getStatistic } from "../../api/event";
import { useParams } from "react-router-dom";

//

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Statistics = () => {
  const { eventId } = useParams();
  const [datas, setData] = useState([]);
  const handleFetchData = async () => {
    const response = await getStatistic(eventId);
    //console.log(response.yearLevels.First);
    setData(response);
  };
  useEffect(() => {
    handleFetchData();
  }, []);
  const studentYearsData = {
    labels: ["1st Years", "2nd Years", "3rd Years", "4th Years"],
    datasets: [
      {
        data: [
          datas.yearLevels?.First || 0,
          datas.yearLevels?.Second || 0,
          datas.yearLevels?.Third || 0,
          datas.yearLevels?.Fourth || 0,
        ],
        backgroundColor: [
          "rgba(137, 121, 255, 1)",
          "rgba(255, 146, 138, 1)",
          "rgba(60, 195, 223, 1)",
          "rgba(255, 174, 76, 1)",
        ],
        borderColor: [
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
        ],
        borderWidth: 1,
      },
    ],
  };
  console.log(datas);

  const campusData = {
    labels: ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"],
    datasets: [
      {
        label: "Number of Students",
        data: [
          datas.campuses?.Main || 0,
          datas.campuses?.Banilad || 0,
          datas.campuses?.LM || 0,
          datas.campuses?.PT || 0,
        ],
        backgroundColor: "rgba(137, 121, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const courseData = {
    labels: ["IT Students", "CS Students"],
    datasets: [
      {
        data: [datas.courses?.BSITS || 0, datas.courses?.BSCS || 0],
        backgroundColor: ["rgba(137, 121, 255, 1)", "rgba(255, 146, 138, 1)"],
        borderColor: ["rgb(255, 255, 255)", "rgb(255, 255, 255)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOption1 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };
  const chartOption2 = {
    maintainAspectRatio: false,
    responsive: true,
    // Ensures the chart fills its container
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div>
      <Link to="/admin/events">
        <button className="lg:mt-5 sm:mt-3 ml-1 mb-2 text-[#002E48] hover:text-[#4398AC] transition duration-200 rounded-lg">
          <i class="fas fa-arrow-left lg:text-xl"></i>
        </button>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center ">
        Population Statistics
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap lg:gap-8 md:gap-8 items-center justify-center">
        {/* Charts Section */}
        <div className="flex flex-col gap-8 w-full lg:w-[50%]">
          <div className="w-full h-[250px] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <Doughnut data={studentYearsData} options={chartOption2} />
          </div>
          <div className="w-full h-[280px] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-4 shadow-md rounded-lg">
            <Bar data={campusData} options={chartOption1} />
          </div>
          <div className="w-full h-[250px] aspect-w-16 aspect-h-9 bg-[#F5F5F5] p-4 shadow-md rounded-lg mb-3">
            <Doughnut data={courseData} options={chartOption2} />
          </div>
        </div>
        {/* Total Number of Attendees Section */}
        <div className="flex flex-col items-center w-full lg:w-[30%] gap-4 mt-8 lg:mt-0 justify-center">
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">Total number of Attendees</p>
            <h3>{datas.totalAttendees}</h3>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">Total Revenue</p>
            <h3>{datas.totalRevenue}</h3>
          </div>
          <div className="2xl:w-[350px] lg:w-[260px] bg-[#D9D9D9] mb-8 text-center p-5 rounded-lg">
            <p>We value your feedback.</p>
            <p className="mb-3">Please enter your evaluation below.</p>
            <p>[LINK for evaluation]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
