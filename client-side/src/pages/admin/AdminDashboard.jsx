import React, { useEffect, useState } from "react";
import axios from "axios";
import { allMembers } from "../../api/admin";

const AdminDashboard = () => {
  const [merchandiseCount, setMerchandiseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [membershipRevenue, setMembershipRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = (data) => {
    console.log("Form Data:", data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await allMembers();

        setStudentCount(studentRes);
      } catch (error) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-center text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-16 md:mt-20 lg:mt-[5.5rem">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col items-center">
          <i className="fas fa-box text-4xl text-blue-500"></i>
          <h2 className="text-lg sm:text-xl font-semibold mt-4">
            Merchandise Created
          </h2>
          <p className="text-xl sm:text-2xl mt-2 sm:mt-4">{}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col items-center">
          <i className="fas fa-user text-4xl text-green-500"></i>
          <h2 className="text-lg sm:text-xl font-semibold mt-4">Students</h2>
          <p className="text-xl sm:text-2xl mt-2 sm:mt-4">{studentCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col items-center">
          <i className="fas fa-shopping-cart text-4xl text-yellow-500"></i>
          <h2 className="text-lg sm:text-xl font-semibold mt-4">
            Placed Orders
          </h2>
          <p className="text-xl sm:text-2xl mt-2 sm:mt-4">{}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col items-center">
          <i className="fas fa-dollar-sign text-4xl text-red-500"></i>
          <h2 className="text-lg sm:text-xl font-semibold mt-4">
            Membership Revenue
          </h2>
          <p className="text-xl sm:text-2xl mt-2 sm:mt-4">${}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
