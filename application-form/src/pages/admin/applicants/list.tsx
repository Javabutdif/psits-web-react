import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import type { Application } from '../../../types/recruitment';

type ApplicantListItem = Pick<
  Application,
  '_id' | 'applicantName' | 'positionTitle' | 'status' | 'createdAt'
>;

const AdminApplicantsList = () => {
  const [applicants, setApplicants] = useState<ApplicantListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await api.get('/recruitment/applicants');
        setApplicants((response.data.data.applicants || []) as ApplicantListItem[]);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const getStatusClass = (status: ApplicantListItem['status']) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Applicants
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Review submitted applications and open individual records.
        </p>
      </header>

      <section className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  Applied
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applicants.map((applicant) => (
                <tr key={applicant._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {applicant.applicantName}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {applicant.positionTitle}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(applicant.status)}`}
                    >
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <Link
                      to={`/admin/application/${applicant._id}`}
                      className="font-semibold text-primary transition-colors hover:text-primary-dark"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminApplicantsList;
