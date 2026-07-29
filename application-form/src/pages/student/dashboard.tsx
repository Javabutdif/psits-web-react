// src/pages/student/dashboard.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import type { Application } from '../../types/recruitment';

const StudentDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/recruitment/applications/me');
        setApplications(response.data.data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading your applications...</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">View and manage your submitted applications</p>
      </header>

      {applications.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-600 mb-6">Your first application gets you closer to your dream job.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              Browse Open Positions
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <section>
          <div className="space-y-4">
            {applications.map((app) => {
              const date = new Date(app.createdAt);
              const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
              
               const getStatusLabel = (status: Application['status']): string => {
                 switch (status) {
                   case 'APPROVED': return 'Approved';
                   case 'REJECTED': return 'Rejected';
                   case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
                   case 'INTERVIEWING': return 'Interviewing';
                   case 'WITHDRAWN': return 'Withdrawn';
                   default: return status;
                 }
               };

               const getStatusBadgeClasses = (status: Application['status']): string => {
                 switch (status) {
                   case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
                   case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
                   case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800 border-purple-200';
                   case 'INTERVIEWING': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                   case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200';
                   default: return 'bg-blue-100 text-blue-800 border-blue-200';
                 }
               };

              return (
                <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{app.positionTitle}</h3>
                        <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
                          Submitted: {formattedDate}
                        </p>
                      </div>
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusBadgeClasses(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                      <Link 
                        to={`/application/${app._id}`} 
                        className="flex-1 inline-flex justify-center px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors border border-transparent"
                      >
                        View Details
                      </Link>
                      {app.documents.resume && (
                        <a 
                          href={`/api/documents/${app.documents.resume.storageKey}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors white-space-nowrap"
                        >
                          Download Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
