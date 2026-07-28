// src/pages/student/details.tsx

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import type { Application, Interview, StatusHistoryItem } from '../../types/recruitment';
import ApplicationTimeline from '@/components/ui/application-timeline';

const StudentApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await api.get(`/recruitment/applications/me/${id}`);
        setApplication(response.data.data);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading...</div></div>;
  if (!application) return <div className="max-w-4xl mx-auto py-12"><div className="text-center"><p className="text-gray-600">Application not found.</p></div></div>;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClasses = () => {
    switch (application.status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'INTERVIEWING': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = () => {
    switch (application.status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
      case 'INTERVIEWING': return 'Interviewing';
      case 'WITHDRAWN': return 'Withdrawn';
      default: return application.status;
    }
  };

  const interview = application.interview;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="flex justify-between items-start pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <p className="text-sm text-gray-500 mt-1">Review your application status and documents</p>
        </div>
        <Link 
          to="/applications" 
          className="flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{application.positionTitle}</h2>
                  {/* Position description not available in current API response - can be fetched separately if needed */}
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusBadgeClasses()}`}>
                  {getStatusLabel()}
                </span>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="py-4 border-r border-gray-100 md:border-r-0 md:border-b">
              <div className="text-xs text-gray-500 mb-1">Submitted On</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(application.createdAt)}</div>
              <div className="text-xs text-gray-400 mt-1">{formatDateTime(application.createdAt)}</div>
            </div>
            <div className="py-4">
              <div className="text-xs text-gray-500 mb-1">Application ID</div>
              <div className="text-sm font-medium text-gray-900 font-mono truncate">{application._id}</div>
            </div>
          </div>

          {interview && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0113 14.172V14a1 1 0 00-1-1h-4a1 1 0 00-1v1.172a2.032 2.032 0 01-.595 1.415L5 17h5m0 0a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Interview Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium text-gray-900">{formatDateTime(interview.scheduledAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{interview.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">{interview.status}</span>
                </div>
                {interview.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <p className="text-sm text-gray-700 italic">{interview.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Documents</h3>
            <div className="space-y-2">
              <a 
                href={`/api/documents/${application.documents.resume.storageKey}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 11-4 0V10M7 10a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2H7zm-5 2h10v12H2V8z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Resume</div>
                    <div className="text-xs text-gray-500">{application.documents.resume.filename}</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4V7" />
                </svg>
              </a>
              
              <a 
                href={`/api/documents/${application.documents.applicationLetter.storageKey}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 11-4 0V10M7 10a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2H7zm-5 2h10v12H2V8z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Application Letter</div>
                    <div className="text-xs text-gray-500">{application.documents.applicationLetter.filename}</div>
                  </div>
                 </div>
                 <svg className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4V7" />
                 </svg>
               </a>
             </div>
           </div>

           {/* Status History Timeline */}
           <section className="mt-8">
             <ApplicationTimeline application={application} />
           </section>
         </div>
       </section>
     </div>
   );
 };
 
 export default StudentApplicationDetails;
