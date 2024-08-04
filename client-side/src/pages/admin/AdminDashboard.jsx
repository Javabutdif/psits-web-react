import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [merchandiseCount, setMerchandiseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [membershipRevenue, setMembershipRevenue] = useState(0);

  useEffect(() => {
    // Fetch the counts from the backend
    const fetchData = async () => {
      try {
        const [merchandiseRes, studentRes, orderRes, revenueRes] =
          await Promise.all([
            axios.get("/api/merchandise/count"),
            axios.get("/api/students/count"),
            axios.get("/api/orders/count"),
            axios.get("/api/memberships/revenue"),
          ]);

        setMerchandiseCount(merchandiseRes.data.count);
        setStudentCount(studentRes.data.count);
        setOrderCount(orderRes.data.count);
        setMembershipRevenue(revenueRes.data.revenue);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold">Merchandise Created</h2>
          <p className="text-2xl mt-4">{merchandiseCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold">Students</h2>
          <p className="text-2xl mt-4">{studentCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold">Placed Orders</h2>
          <p className="text-2xl mt-4">{orderCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold">Membership Revenue</h2>
          <p className="text-2xl mt-4">${membershipRevenue}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
