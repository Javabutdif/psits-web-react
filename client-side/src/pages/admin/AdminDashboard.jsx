import React, { useEffect, useState } from "react";
import { allMembers } from "../../api/admin";

const AdminDashboard = () => {
  const [merchandiseCount, setMerchandiseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [membershipRevenue, setMembershipRevenue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await allMembers();
        setStudentCount(studentRes);

        // Example fetching other data (replace with actual API calls)
        // const merchandiseRes = await getMerchandiseCount();
        // const orderRes = await getOrderCount();
        // const revenueRes = await getMembershipRevenue();
        // const logsRes = await getLogs();

        // Simulate data
        setMerchandiseCount(120); // Example value
        setOrderCount(45); // Example value
        setMembershipRevenue(1500); // Example value
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
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <i className="fas fa-dollar-sign text-3xl text-red-500 mb-2"></i>
          <h2 className="text-sm font-semibold mb-1">Membership Revenue</h2>
          <p className="text-lg text-gray-700"> ₱{membershipRevenue}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Action
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-600">{log.date}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {log.action}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
