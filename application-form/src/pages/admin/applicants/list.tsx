// src/pages/admin/applicants/list.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';

const AdminApplicantsList = () => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await api.get('/recruitment/applicants');
        setApplicants(response.data.data.applicants || []);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Position</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Applied</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicants.map((app) => (
              <tr key={app._id}>
                <td className="py-4 px-4 text-sm text-gray-900">{app.applicantName}</td>
                <td className="py-4 px-4 text-sm text-gray-500">{app.positionTitle}</td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-4 text-sm">
                  <Link to={`/admin/application/${app._id}`} className="text-primary hover:text-primary-dark">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplicantsList;
