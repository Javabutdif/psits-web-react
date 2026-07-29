import { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import type { RecruitmentPosition } from '../../types/recruitment';
import PositionCard from '../../components/common_PositionCard';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { extractList } from '@/lib/utils';
import { Search, Briefcase } from 'lucide-react';

type PositionFilter = 'OPEN' | 'CLOSED' | 'DRAFT' | 'all';

const PublicLanding = () => {
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PositionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await api.get('/v2/recruitment/positions');
        setPositions(extractList<RecruitmentPosition>(response.data.data));
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      const matchesStatus = filterStatus === 'all' || pos.hiringStatus === filterStatus;
      const matchesSearch = searchQuery === '' ||
        pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pos.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [positions, filterStatus, searchQuery]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="mt-4 text-sm text-gray-600">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          PSITS Recruitment
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Explore open positions and join our team of talented professionals
        </p>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              prepend={<Search className="h-4 w-4 text-gray-400" />}
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'OPEN', 'DRAFT', 'CLOSED'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status as PositionFilter)}
                  className="whitespace-nowrap"
                >
                  {status === 'all' ? 'All' : status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {filteredPositions.length} Open Position{filteredPositions.length !== 1 ? 's' : ''}
        </h2>
        {filteredPositions.length > 0 && (
          <Badge variant="secondary">
            Showing {filteredPositions.length} results
          </Badge>
        )}
      </div>

      {filteredPositions.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title={filterStatus === 'all' ? 'No Positions Found' : 'No Open Positions'}
          description={
            filterStatus === 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No positions currently available in this status. Try selecting "All" statuses.'
          }
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setFilterStatus('all');
            },
          }}
        />
      ) : (
        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPositions.map((position) => (
              <PositionCard key={position._id} position={position} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicLanding;
