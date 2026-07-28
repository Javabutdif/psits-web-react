import type { RecruitmentPosition } from '../types/recruitment';
import Badge from '@/components/ui/badge';

interface PositionStatusBadgeProps {
  status: RecruitmentPosition['hiringStatus'];
}

export const PositionStatusBadge = ({ status }: PositionStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'DRAFT': return 'warning';
      case 'CLOSED': return 'danger';
      default: return 'secondary';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'DRAFT': return 'Draft';
      case 'CLOSED': return 'Closed';
      default: return status;
    }
  };

  return (
    <Badge variant={getVariant()}>{getLabel()}</Badge>
  );
};
