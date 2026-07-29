import { cn } from '@/lib/utils';
import type { Application } from '../../types/recruitment';
import { Clock, CheckCircle2, XCircle, History } from 'lucide-react';

type StatusHistoryItem = {
  status: string;
  changedAt: string;
  changedBy: string;
  notes?: string;
};

interface ApplicationTimelineProps {
  application: Application;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
    case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
    case 'INTERVIEW_SCHEDULED': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'INTERVIEWING': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'SUBMITTED': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED': return CheckCircle2;
    case 'REJECTED': return XCircle;
    default: return Clock;
  }
};

const ApplicationTimeline = ({ application, className }: ApplicationTimelineProps) => {
  const timelineItems: StatusHistoryItem[] = [];

  if (application.statusHistory && application.statusHistory.length > 0) {
    timelineItems.push(...application.statusHistory);
  } else {
    timelineItems.push({
      status: application.status,
      changedAt: application.createdAt || new Date().toISOString(),
      changedBy: application.reviewer || 'System',
      notes: '',
    });
  }

  const sortedItems = [...timelineItems].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <History className="h-5 w-5 text-primary" />
        Status History
      </h3>

      {sortedItems.length === 0 ? (
        <p className="py-4 text-sm text-gray-500">No status history available.</p>
      ) : (
        sortedItems.map((item, index) => {
          const isLast = index === sortedItems.length - 1;
          const StatusIcon = getStatusIcon(item.status);

          return (
            <div key={index} className="relative pl-8">
              {!isLast && (
                <div className="absolute bottom-0 left-3 top-10 w-px bg-gray-200" />
              )}

              <div className="absolute left-0 top-2 z-10 h-4 w-4 rounded-full border-2 bg-white">
                <div
                  className={cn(
                    'mx-auto mt-0.5 h-3 w-3 rounded-full border border-white shadow-sm',
                    getStatusColor(item.status)
                  )}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                      getStatusColor(item.status)
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mb-1 text-sm text-gray-700">
                  <strong>Changed by:</strong> {item.changedBy || 'System'}
                </p>
                {item.notes && (
                  <p className="text-sm italic text-gray-600">&ldquo;{item.notes}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ApplicationTimeline;
