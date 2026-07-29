import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import type { Application } from '../../types/recruitment';
import Badge from '@/components/ui/badge';
import EmptyState from '@/components/ui/empty-state';
import { extractList } from '@/lib/utils';
import { Download, Eye, Send } from 'lucide-react';

const StudentDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/v2/recruitment/applications/me');
        setApplications(extractList<Application>(response.data.data));
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="text-sm text-gray-600">Loading your applications...</div></div>;

  return (
    <div className="mx-auto max-w-4xl py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-2 text-gray-600">View and manage your submitted applications</p>
      </header>

      {applications.length === 0 ? (
        <EmptyState
          icon={<Send className="h-8 w-8" />}
          title="No Applications Yet"
          description="Your first application gets you closer to your dream job."
          action={{
            label: 'Browse Open Positions',
            onClick: () => window.location.href = '/',
          }}
        />
      ) : (
        <section>
          <div className="space-y-4">
            {applications.map((app) => {
              const date = new Date(app.createdAt);
              const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              const getBadgeVariant = (status: Application['status']): 'primary' | 'success' | 'warning' | 'danger' => {
                switch (status) {
                  case 'APPROVED': return 'success';
                  case 'REJECTED': return 'danger';
                  case 'INTERVIEW_SCHEDULED':
                  case 'INTERVIEWING': return 'warning';
                  default: return 'primary';
                }
              };

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

              return (
                <div
                  key={app._id}
                  className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-gray-900">{app.positionTitle}</h3>
                        <p className="mt-1 text-sm text-gray-500">Submitted: {formattedDate}</p>
                      </div>
                      <Badge variant={getBadgeVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    <div className="flex gap-4 border-t border-gray-100 pt-4">
                      <Link
                        to={`/application/${app._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                      {app.documents.resume && (
                        <a
                          href={`/api/documents/${app.documents.resume.storageKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4" />
                          Resume
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
