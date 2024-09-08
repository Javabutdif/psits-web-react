import React, { useEffect, useState } from "react";
import { allMembers, merchCreated, placedOrders } from "../../api/admin";

const AdminDashboard = () => {
  const [merchandiseCount, setMerchandiseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await allMembers();
        const merchCreate = await merchCreated();
        const placedOrder = await placedOrders();

        setStudentCount(studentRes);

        setMerchandiseCount(merchCreate);
        setOrderCount(placedOrder);

        setLogs([
          {
            date: "2024-09-01",
            action: "Created",
            details: "Added new merchandise",
          },
          {
            date: "2024-09-02",
            action: "Order Placed",
            details: "Order #1234",
          },
        ]);
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
    <div className="p-4 md:p-8 lg:p-12">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <i className="fas fa-box text-3xl text-blue-500 mb-2"></i>
          <h2 className="text-sm font-semibold mb-1">Merchandise Created</h2>
          <p className="text-lg text-gray-700">{merchandiseCount}</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <i className="fas fa-user text-3xl text-green-500 mb-2"></i>
          <h2 className="text-sm font-semibold mb-1">Students</h2>
          <p className="text-lg text-gray-700">{studentCount}</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <i className="fas fa-shopping-cart text-3xl text-yellow-500 mb-2"></i>
          <h2 className="text-sm font-semibold mb-1">Placed Orders</h2>
          <p className="text-lg text-gray-700">{orderCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
