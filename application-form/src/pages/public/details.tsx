// src/pages/public/details.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/auth.context';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import api from '../../api/client';
import { PositionStatusBadge } from '../../components/common_PositionStatusBadge';
import type { RecruitmentPosition } from '../../types/recruitment';

const PublicPositionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [position, setPosition] = useState<RecruitmentPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await api.get(`/recruitment/positions/${id}`);
        setPosition(response.data.data);
      } catch (error) {
        console.error('Error fetching position:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPosition();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading...</div></div>;
  if (!position) return <div className="max-w-4xl mx-auto py-12"><div className="text-center"><p className="text-gray-600">Position not found.</p></div></div>;

  // Check if student is authenticated
  if (!user) {
    if (id) {
      window.localStorage.setItem('applyPositionId', id);
    }
    return <Navigate to={`/login?redirect=${location.search}`} replace />;
  }

  const handleApply = () => {
    window.location.href = `/apply/${position._id}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Positions
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{position.title}</h1>
            <PositionStatusBadge status={position.hiringStatus} />
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="text-sm text-gray-600">Application Deadline</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(position.applicationDeadline)}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Position Overview</h2>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {position.description}
        </div>
      </section>

      {position.responsibilities && position.responsibilities.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Responsibilities</h2>
          <ul className="space-y-2">
            {position.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="mt-1 text-primary">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {position.requirements && position.requirements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Requirements</h2>
          <ul className="space-y-2">
            {position.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="mt-1 text-primary">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pt-6 border-t border-gray-200">
        <button
          onClick={handleApply}
          className="w-full md:w-auto px-8 py-4 bg-primary text-white text-lg font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md"
        >
          Apply Now
        </button>
      </section>
    </div>
  );
};

export default PublicPositionDetails;
