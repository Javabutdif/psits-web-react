// src/pages/admin/applicants/detail.tsx

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../api/client';

const AdminApplicantDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchApp = async () => {
        try {
          const response = await api.get(`/recruitment/applications/${id}`);
          setApplication(response.data.data);
          setStatus(response.data.data.status);
        } catch (error) {
          console.error('Error fetching application:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchApp();
    }
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!application) return <div className="text-center py-12">Application not found.</div>;

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/recruitment/applications/${id}/status`, { status, note });
      alert('Status updated successfully');
      setShowStatusForm(false);
      setNote('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Application Details</h1>
        <Link to="/admin/applicants" className="text-gray-600 hover:text-gray-900">Back to Applicants</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Position Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Position</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {application.positionTitle}</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
              application.positionHiringStatus === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>{application.positionHiringStatus}</span></p>
            <p><strong>Deadline:</strong> {application.applicationDeadline || 'TBD'}</p>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Applicant</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {application.applicantName}</p>
            <p><strong>ID:</strong> {application.idNumber}</p>
            <p><strong>Email:</strong> {application.email}</p>
            <p><strong>Course:</strong> {application.course || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <div className="space-y-2 text-sm">
          <a 
            href={`/api/documents/${application.documents.resume.storageKey}`} 
            target="_blank"
            className="text-primary hover:text-primary-dark"
          >
            Download Resume ({application.documents.resume.filename})
          </a>
          <a 
            href={`/api/documents/${application.documents.applicationLetter.storageKey}`} 
            target="_blank"
            className="text-primary hover:text-primary-dark"
          >
            Download Application Letter ({application.documents.applicationLetter.filename})
          </a>
        </div>
      </div>

      {/* Application Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Application Status</h2>
          {!showStatusForm ? (
            <button onClick={() => setShowStatusForm(true)} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
              Change Status
            </button>
          ) : (
            <button onClick={() => setShowStatusForm(false)} className="text-gray-600 hover:text-gray-900">Cancel</button>
          )}
        </div>

        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium {
            application.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }">
            {application.status}
          </span>
        </div>

        {showStatusForm && (
          <div className="pt-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleStatusUpdate() }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
                  placeholder="Add internal notes..."
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
                  Update Status
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowStatusForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Interview Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Interview</h2>
        {application.interview ? (
          (() => {
            const interview = application.interview;
            return (
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> {new Date(interview.scheduledAt).toLocaleString()}</p>
                <p><strong>Location:</strong> {interview.location || 'Not specified'}</p>
                <p><strong>Status:</strong> {interview.status}</p>
                {interview.notes && <p><strong>Notes:</strong> {interview.notes}</p>}
              </div>
            );
          })()
        ) : (
          <p className="text-gray-500">No interview scheduled</p>
        )}
      </div>
    </div>
  );
};

export default AdminApplicantDetails;
