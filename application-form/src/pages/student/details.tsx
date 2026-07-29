import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import type { Application } from '../../types/recruitment';
import ApplicationTimeline from '@/components/ui/application-timeline';
import Badge from '@/components/ui/badge';
import { ArrowLeft, Download, Calendar } from 'lucide-react';

const StudentApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await api.get(`/v2/recruitment/applications/me/${id}`);
        setApplication(response.data.data);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="text-sm text-gray-600">Loading...</div></div>;
  if (!application) return <div className="mx-auto max-w-4xl py-12"><div className="text-center"><p className="text-gray-600">Application not found.</p></div></div>;

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string): string => new Date(dateString).toLocaleString();

  const interview = application.interview;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <header className="flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <p className="mt-1 text-sm text-gray-500">Review your application status and documents</p>
        </div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-gray-900">{application.positionTitle}</h2>
            </div>
            <Badge variant={
              application.status === 'APPROVED' ? 'success' :
              application.status === 'REJECTED' ? 'danger' :
              application.status === 'INTERVIEW_SCHEDULED' || application.status === 'INTERVIEWING' ? 'warning' :
              'primary'
            }>
              {application.status}
            </Badge>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-b border-gray-100 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <div className="text-xs text-gray-500">Submitted On</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(application.createdAt)}</div>
              <div className="mt-1 text-xs text-gray-400">{formatDateTime(application.createdAt)}</div>
            </div>
            <div className="pb-4 md:pb-0">
              <div className="text-xs text-gray-500">Application ID</div>
              <div className="truncate font-mono text-sm font-medium text-gray-900">{application._id}</div>
            </div>
          </div>

          {interview && (
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Calendar className="h-5 w-5 text-purple-600" />
                Interview Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium text-gray-900">{formatDateTime(interview.scheduledAt)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{interview.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">{interview.status}</span>
                </div>
                {interview.notes && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="mb-1 text-xs text-gray-500">Notes</div>
                    <p className="text-sm italic text-gray-700">{interview.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900">Documents</h3>
            <div className="space-y-2">
              <a
                href={`/api/documents/${application.documents.resume.storageKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-gray-900">Resume</div>
                    <div className="text-xs text-gray-500">{application.documents.resume.originalFilename}</div>
                  </div>
                </div>
                <Download className="h-5 w-5 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
              </a>

              <a
                href={`/api/documents/${application.documents.applicationLetter.storageKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-gray-900">Application Letter</div>
                    <div className="text-xs text-gray-500">{application.documents.applicationLetter.originalFilename}</div>
                  </div>
                </div>
                <Download className="h-5 w-5 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
              </a>
            </div>
          </div>

          <section className="mt-8">
            <ApplicationTimeline application={application} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationDetails;
