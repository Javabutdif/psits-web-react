import { useState, useEffect } from 'react';
import api from '../../api/client';
import { extractList } from '@/lib/utils';
import { Briefcase, Users, FileText, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ positions: 0, applications: 0, applicants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const posResp = await api.get('/v2/recruitment/positions');
        const positions = extractList(posResp.data.data).length;
        setStats({ positions, applications: 0, applicants: 0 });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="py-12 text-center text-sm text-gray-600">Loading...</div>;

  const statCards = [
    { label: 'Positions', value: stats.positions, icon: Briefcase, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Applications', value: stats.applications, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Applicants', value: stats.applicants, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recruitment Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your recruitment activity</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/positions/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Create Position
          </Link>
          <Link
            to="/admin/applicants"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            <Users className="h-4 w-4" />
            Review Applicants
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
