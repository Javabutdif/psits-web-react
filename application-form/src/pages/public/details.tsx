import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/auth.context';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { PositionStatusBadge } from '../../components/common_PositionStatusBadge';
import type { RecruitmentPosition } from '../../types/recruitment';
import { ArrowLeft, Calendar, Briefcase } from 'lucide-react';

const PublicPositionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [position, setPosition] = useState<RecruitmentPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await api.get(`/v2/recruitment/positions/${id}`);
        setPosition(response.data.data);
      } catch (error) {
        console.error('Error fetching position:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPosition();
  }, [id]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="text-sm text-gray-600">Loading...</div></div>;
  if (!position) return <div className="mx-auto max-w-4xl py-12"><div className="text-center"><p className="text-gray-600">Position not found.</p></div></div>;

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
    <div className="mx-auto max-w-4xl py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Positions
      </button>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">{position.title}</h1>
          <PositionStatusBadge status={position.hiringStatus} />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Application Deadline</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(position.applicationDeadline)}</p>
          </div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-900">Position Overview</h2>
        <div className="prose prose-sm max-w-none leading-relaxed text-gray-700">
          {position.description}
        </div>
      </section>

      {position.responsibilities && position.responsibilities.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-900">Responsibilities</h2>
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
          <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-900">Requirements</h2>
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

      <section className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <button
          onClick={handleApply}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        >
          <Briefcase className="h-5 w-5" />
          Apply Now
        </button>
      </section>
    </div>
  );
};

export default PublicPositionDetails;
