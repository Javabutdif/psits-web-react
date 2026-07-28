import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../../api/client';
import type { Application } from '../../../types/recruitment';

type AdminApplicationDetail = Application & {
  positionHiringStatus?: 'OPEN' | 'DRAFT' | 'CLOSED';
  applicationDeadline?: string;
  idNumber?: string;
  email?: string;
  course?: string;
};

const statusOptions: Application['status'][] = [
  'SUBMITTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWING',
  'APPROVED',
  'REJECTED',
];

const AdminApplicantDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Application['status']>('SUBMITTED');
  const [note, setNote] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await api.get(`/recruitment/applications/${id}`);
        const nextApplication = response.data.data as AdminApplicationDetail;
        setApplication(nextApplication);
        setStatus(nextApplication.status);
      } catch (error) {
        console.error('Error fetching application:', error);
        toast.error('Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApp();
    }
  }, [id]);

  const handleStatusUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await api.patch(`/recruitment/applications/${id}/status`, { status, note });
      toast.success('Status updated successfully');
      setShowStatusForm(false);
      setNote('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusClass = (currentStatus: Application['status']) => {
    switch (currentStatus) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800';
      case 'INTERVIEWING':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-gray-600">Loading...</div>;
  }

  if (!application) {
    return <div className="py-16 text-center text-gray-600">Application not found.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Application Details
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Review applicant information, documents, and status history.
          </p>
        </div>
        <Link
          to="/admin/applicants"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Back to Applicants
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="text-lg font-bold text-gray-900">Position</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Title:</span>{' '}
              {application.positionTitle}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Hiring Status:</span>{' '}
              <span className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}>
                {application.positionHiringStatus ?? 'OPEN'}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-900">Deadline:</span>{' '}
              {application.applicationDeadline || 'TBD'}
            </p>
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="text-lg font-bold text-gray-900">Applicant</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Name:</span>{' '}
              {application.applicantName}
            </p>
            <p>
              <span className="font-semibold text-gray-900">ID:</span>{' '}
              {application.idNumber || 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Email:</span>{' '}
              {application.email || 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Course:</span>{' '}
              {application.course || 'N/A'}
            </p>
          </div>
        </section>
      </div>

      <section className="surface p-6">
        <h2 className="text-lg font-bold text-gray-900">Documents</h2>
        <div className="mt-4 space-y-3 text-sm">
          <a
            href={`/api/documents/${application.documents.resume.storageKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-primary transition-colors hover:bg-gray-100"
          >
            <span>Download Resume ({application.documents.resume.originalFilename})</span>
            <span>Open</span>
          </a>
          <a
            href={`/api/documents/${application.documents.applicationLetter.storageKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-primary transition-colors hover:bg-gray-100"
          >
            <span>
              Download Application Letter ({application.documents.applicationLetter.originalFilename})
            </span>
            <span>Open</span>
          </a>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Application Status</h2>
          {!showStatusForm ? (
            <button
              onClick={() => setShowStatusForm(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              Change Status
            </button>
          ) : (
            <button
              onClick={() => setShowStatusForm(false)}
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="mt-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}>
            {application.status}
          </span>
        </div>

        {showStatusForm && (
          <form onSubmit={handleStatusUpdate} className="mt-6 space-y-4 border-t border-gray-100 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">New Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Application['status'])}
                className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Internal Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="flex w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                placeholder="Add internal notes..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setShowStatusForm(false)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="surface p-6">
        <h2 className="text-lg font-bold text-gray-900">Interview</h2>
        {application.interview ? (
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Date:</span>{' '}
              {new Date(application.interview.scheduledAt).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Location:</span>{' '}
              {application.interview.location || 'Not specified'}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Status:</span>{' '}
              {application.interview.status}
            </p>
            {application.interview.notes && (
              <p className="italic text-gray-600">
                <span className="font-semibold text-gray-900 not-italic">Notes:</span>{' '}
                {application.interview.notes}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No interview scheduled</p>
        )}
      </section>
    </div>
  );
};

export default AdminApplicantDetails;
