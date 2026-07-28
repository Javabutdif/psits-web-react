// src/pages/admin/dashboard.tsx

import { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ positions: 0, applications: 0, applicants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch positions count
        const posResp = await api.get('/recruitment/positions');
        const positions = posResp.data.data?.length || 0;
        
        // Fetch applications count (simplified - would need separate endpoint)
        const apps = Math.floor(Math.random() * 50); // mock
        
        setStats({ positions, applications: apps, applicants: Math.floor(Math.random() * 30) });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recruitment Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-primary">{stats.positions}</div>
          <div className="text-sm text-gray-600 mt-1">Positions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.applications}</div>
          <div className="text-sm text-gray-600 mt-1">Applications</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.applicants}</div>
          <div className="text-sm text-gray-600 mt-1">Applicants</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <a href="/admin/positions/new" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
            Create Position
          </a>
          <a href="/admin/applicants" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Review Applicants
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
