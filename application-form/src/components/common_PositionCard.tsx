import { Link } from 'react-router-dom';
import type { RecruitmentPosition } from '../types/recruitment';
import Badge from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PositionCardProps {
  position: RecruitmentPosition;
}

const PositionCard = ({ position }: PositionCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden", "")}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{position.title}</h3>
          <Badge variant={position.hiringStatus === 'OPEN' ? 'success' : position.hiringStatus === 'CLOSED' ? 'danger' : 'warning'}>
            {position.hiringStatus}
          </Badge>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
          {position.description}
        </p>

        {position.applicationDeadline && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Deadline: {formatDate(position.applicationDeadline) || 'TBD'}</span>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link
            to={`/position/${position._id}`}
            className="inline-flex items-center px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors shadow-sm w-full justify-center"
          >
            View Details
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
