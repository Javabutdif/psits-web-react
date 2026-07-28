// src/pages/public/landing.tsx

import { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import type { RecruitmentPosition } from '../../types/recruitment';
import PositionCard from '../../components/common_PositionCard';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

const PublicLanding = () => {
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'OPEN' | 'CLOSED' | 'DRAFT' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await api.get('/recruitment/positions');
        setPositions(response.data.data || []);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Find Your Dream Role
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Explore open positions and join our team of talented professionals
          </p>
          
          {/* Search & Filter Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'OPEN', 'DRAFT', 'CLOSED'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status as any)}
                    className="whitespace-nowrap"
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {filteredPositions.length} Open Position{filteredPositions.length !== 1 ? 's' : ''}
          </h2>
          {filteredPositions.length > 0 && (
            <Badge variant="secondary">
              Showing {filteredPositions.length} results
            </Badge>
          )}
        </div>
      </div>

      {/* Positions Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredPositions.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{filterStatus === 'all' ? 'No Positions Found' : 'No Open Positions'}</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No positions currently available in this status. Try selecting "All" statuses.'}
              </p>
              <Button 
                onClick={() => { 
                  setSearchQuery(''); 
                  setFilterStatus('all'); 
                }}
                variant="secondary"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPositions.map((position) => (
                <PositionCard key={position._id} position={position} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PublicLanding;
