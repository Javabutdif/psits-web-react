import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import type { Application } from '../../../types/recruitment';
import Badge from '@/components/ui/badge';
import { extractList } from '@/lib/utils';
import { Eye } from 'lucide-react';

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
        const response = await api.get('/v2/recruitment/applicants');
        setApplicants(extractList<ApplicantListItem>(response.data.data));
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const getBadgeVariant = (status: ApplicantListItem['status']): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEWING': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Applicants</h1>
        <p className="mt-1 text-sm text-gray-600">Review submitted applications and open individual records.</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applicants.map((applicant) => (
                <tr key={applicant._id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {applicant.applicantName}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {applicant.positionTitle}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <Badge variant={getBadgeVariant(applicant.status)}>
                      {applicant.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <Link
                      to={`/admin/application/${applicant._id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <Eye className="h-3 w-3" />
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicantsList;
