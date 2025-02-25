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
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };
  const chartOption2 = {
    maintainAspectRatio: false,
    responsive: true,

    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };
  const campusAYearsData = {
    labels: ["First Year", "Second Year", "Third Year", "Fourth Year"],
    datasets: [
      {
        label: datas?.yearLevelsByCampus?.[0]?.campus,
        data: [
          datas?.yearLevelsByCampus?.[0]?.yearLevels?.First || 0,

          datas?.yearLevelsByCampus?.[0]?.yearLevels?.Second || 0,
          datas?.yearLevelsByCampus?.[0]?.yearLevels?.Third || 0,
          datas?.yearLevelsByCampus?.[0]?.yearLevels?.Fourth || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const campusBYearsData = {
    labels: ["First Year", "Second Year", "Third Year", "Fourth Year"],
    datasets: [
      {
        label: datas?.yearLevelsByCampus?.[1]?.campus,
        data: [
          datas?.yearLevelsByCampus?.[1]?.yearLevels?.First || 0,

          datas?.yearLevelsByCampus?.[1]?.yearLevels?.Second || 0,

          datas?.yearLevelsByCampus?.[1]?.yearLevels?.Third || 0,

          datas?.yearLevelsByCampus?.[1]?.yearLevels?.Fourth || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const campusCYearsData = {
    labels: ["First Year", "Second Year", "Third Year", "Fourth Year"],
    datasets: [
      {
        label: datas?.yearLevelsByCampus?.[2]?.campus,
        data: [
          datas?.yearLevelsByCampus?.[2]?.yearLevels?.First || 0,
          datas?.yearLevelsByCampus?.[2]?.yearLevels?.Second || 0,
          datas?.yearLevelsByCampus?.[2]?.yearLevels?.Third || 0,
          datas?.yearLevelsByCampus?.[2]?.yearLevels?.Fourth || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const campusDYearsData = {
    labels: ["First Year", "Second Year", "Third Year", "Fourth Year"],
    datasets: [
      {
        label: datas?.yearLevelsByCampus?.[3]?.campus,
        data: [
          datas?.yearLevelsByCampus?.[3]?.yearLevels?.First || 0,
          datas?.yearLevelsByCampus?.[3]?.yearLevels?.Second || 0,
          datas?.yearLevelsByCampus?.[3]?.yearLevels?.Third || 0,
          datas?.yearLevelsByCampus?.[3]?.yearLevels?.Fourth || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const attendedStudentYearsData = {
    labels: ["First Year", "Second Year", "Third Year", "Fourth Year"],
    datasets: [
      {
        label: "Attended Students",
        data: [
          datas?.yearLevelsAttended?.First,
          datas?.yearLevelsAttended?.Second,
          datas?.yearLevelsAttended?.Third,
          datas?.yearLevelsAttended?.Fourth,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const attendedCampusData = {
    labels: ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"],
    datasets: [
      {
        label: "Total Attended Students [Campus] ",
        data: [
          datas?.campusesAttended?.Main,
          datas?.campusesAttended?.Banilad,
          datas?.campusesAttended?.LM,
          datas?.campusesAttended?.PT,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div>
      <Link to="/admin/events">
        <button className="lg:mt-5 sm:mt-3 ml-1 mb-2 text-[#002E48] hover:text-[#4398AC] transition duration-200 rounded-lg">
          <i className="fas fa-arrow-left lg:text-xl"></i>
        </button>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Population Statistics
      </h1>

      {/* Charts Section */}
      <div className="flex flex-wrap lg:flex-nowrap lg:gap-8 md:gap-8 items-start justify-center">
        <div className="flex flex-col gap-8 w-full lg:w-[50%]">
          {/* Student Year Distribution */}
          <div className="w-full h-[250px] bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <Doughnut data={studentYearsData} options={chartOption2} />
          </div>
          {/* Campus-wise Distribution */}
          <div className="w-full h-[280px] bg-[#F5F5F5] p-4 shadow-md rounded-lg">
            <Bar data={campusData} options={chartOption1} />
          </div>
          {/* Course Distribution */}
          <div className="w-full h-[250px] bg-[#F5F5F5] p-4 shadow-md rounded-lg mb-3">
            <Doughnut data={courseData} options={chartOption2} />
          </div>
        </div>

        {/* Total Numbers Section */}
        <div className="flex flex-col items-center w-full lg:w-[30%] gap-4 mt-8 lg:mt-0">
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">Total number of Attendees</p>
            <h3>{datas.totalAttendees}</h3>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">{datas.salesData?.[0]?.campus}</p>
            <h4>Unit Sold: {datas.salesData?.[0]?.unitsSold}</h4>
            <h4>Total Revenue: {datas.salesData?.[0]?.totalRevenue}</h4>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">{datas.salesData?.[1]?.campus}</p>
            <h4>Unit Sold: {datas.salesData?.[1]?.unitsSold}</h4>
            <h4>Total Revenue: {datas.salesData?.[1]?.totalRevenue}</h4>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">{datas.salesData?.[2]?.campus}</p>
            <h4>Unit Sold: {datas.salesData?.[2]?.unitsSold}</h4>
            <h4>Total Revenue: {datas.salesData?.[2]?.totalRevenue}</h4>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">{datas.salesData?.[3]?.campus}</p>
            <h4>Unit Sold: {datas.salesData?.[3]?.unitsSold}</h4>
            <h4>Total Revenue: {datas.salesData?.[3]?.totalRevenue}</h4>
          </div>
          <div className="lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p className="mb-3">Total Revenue</p>
            <h3>{datas.totalRevenue}</h3>
          </div>
          <div className="2xl:w-[350px] lg:w-[260px] bg-[#D9D9D9] text-center p-5 rounded-lg">
            <p>We value your feedback.</p>
            <p className="mb-3">Please enter your evaluation below.</p>
            <p>[LINK for evaluation]</p>
          </div>
        </div>
      </div>

      {/* Campus-wise Breakdown for Years */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-center mb-4">
          Yearly Distribution per Campus
        </h2>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
          <div className="bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <h3 className="text-md font-semibold text-center mb-2">
              {" "}
              UC-{datas?.yearLevelsByCampus?.[0]?.campus}
            </h3>
            <Bar data={campusAYearsData} options={chartOption1} />
          </div>
          <div className="bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <h3 className="text-md font-semibold text-center mb-2">
              {" "}
              UC-{datas?.yearLevelsByCampus?.[1]?.campus}
            </h3>
            <Bar data={campusBYearsData} options={chartOption1} />
          </div>
          <div className="bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <h3 className="text-md font-semibold text-center mb-2">
              {" "}
              UC-{datas?.yearLevelsByCampus?.[2]?.campus}
            </h3>
            <Bar data={campusCYearsData} options={chartOption1} />
          </div>
          <div className="bg-[#F5F5F5] p-3 shadow-md rounded-lg">
            <h3 className="text-md font-semibold text-center mb-2">
              {" "}
              UC-{datas?.yearLevelsByCampus?.[3]?.campus}
            </h3>
            <Bar data={campusDYearsData} options={chartOption1} />
          </div>
        </div>
      </div>

      {/* Attended Students Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-center mb-5">
          Attended Students Breakdown
        </h2>
        <div className="flex flex-wrap lg:flex-nowrap gap-8 items-center justify-center">
          <div className="flex flex-col gap-8 w-full lg:w-[50%]">
            <div className="w-full h-[250px] bg-[#F5F5F5] p-3 shadow-md rounded-lg">
              <Doughnut
                data={attendedStudentYearsData}
                options={chartOption2}
              />
            </div>
            <div className="w-full h-[280px] bg-[#F5F5F5] p-4 shadow-md rounded-lg">
              <Bar data={attendedCampusData} options={chartOption1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
