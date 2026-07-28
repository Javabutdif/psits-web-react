import { Link } from 'react-router-dom';
import type { RecruitmentPosition } from '../types/recruitment';
import Badge from '@/components/ui/badge';

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
    <article className="surface group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="h-1 bg-gradient-to-r from-primary-300 via-primary to-primary-700" />
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-gray-900">{position.title}</h3>
          <Badge variant={position.hiringStatus === 'OPEN' ? 'success' : position.hiringStatus === 'CLOSED' ? 'danger' : 'warning'}>
            {position.hiringStatus}
          </Badge>
        </div>

        <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-gray-600">
          {position.description}
        </p>

        {position.applicationDeadline && (
          <div className="mb-4 rounded-2xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Deadline: {formatDate(position.applicationDeadline) || 'TBD'}</span>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link
            to={`/position/${position._id}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          >
            View Details
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PositionCard;
