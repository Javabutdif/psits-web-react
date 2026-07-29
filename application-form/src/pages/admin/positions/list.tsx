// src/pages/admin/positions/list.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import type { RecruitmentPosition } from '../../../types/recruitment';

const AdminPositionsList = () => {
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        // For admin, get all positions including draft/closed
        const allResp = await api.get('/admin/recruitment/positions'); // hypothetical endpoint
        setPositions(allResp.data.data || []);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Positions</h1>
        <Link to="/admin/positions/new" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
          New Position
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Title</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Deadline</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Applications</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map((pos) => (
              <tr key={pos._id}>
                <td className="py-4 px-4 text-sm text-gray-900">{pos.title}</td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    pos.hiringStatus === 'OPEN' ? 'bg-green-100 text-green-800' :
                    pos.hiringStatus === 'CLOSED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pos.hiringStatus}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{pos.applicationDeadline || 'TBD'}</td>
                <td className="py-4 px-4 text-sm text-gray-500">0</td>
                <td className="py-4 px-4 text-sm">
                  <Link to={`/admin/positions/edit/${pos._id}`} className="text-primary hover:text-primary-dark mr-4">Edit</Link>
                  <Link to="#" className="text-red-600 hover:text-red-900">Delete</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPositionsList;
