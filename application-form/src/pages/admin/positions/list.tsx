import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import type { RecruitmentPosition } from '../../../types/recruitment';
import Badge from '@/components/ui/badge';
import { extractList } from '@/lib/utils';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPositionsList = () => {
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const allResp = await api.get('/v2/recruitment/positions');
        setPositions(extractList<RecruitmentPosition>(allResp.data.data));
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const handleDelete = async (position: RecruitmentPosition) => {
    const confirmed = window.confirm(`Delete "${position.title}"?`);
    if (!confirmed) return;

    setDeletingId(position._id);
    try {
      await api.delete(`/v2/recruitment/positions/${position._id}`);
      setPositions((currentPositions) =>
        currentPositions.filter((item) => item._id !== position._id)
      );
      toast.success('Position deleted successfully');
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete position');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="py-12 text-center text-sm text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Positions</h1>
          <p className="mt-1 text-sm text-gray-600">Manage recruitment positions</p>
        </div>
        <Link
          to="/admin/positions/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          New Position
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Applications</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {positions.map((pos) => (
                <tr key={pos._id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{pos.title}</td>
                  <td className="px-4 py-4 text-sm">
                    <Badge variant={
                      pos.hiringStatus === 'OPEN' ? 'success' :
                      pos.hiringStatus === 'CLOSED' ? 'danger' : 'warning'
                    }>
                      {pos.hiringStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{pos.applicationDeadline || 'TBD'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">0</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/positions/edit/${pos._id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pos)}
                        disabled={deletingId === pos._id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingId === pos._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
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

export default AdminPositionsList;
