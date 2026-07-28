// src/components/ui/application-timeline.tsx

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Application } from '../../types/recruitment';

// Local definition for status history item (not relying on imported type to avoid circular issues)
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

const statusOrder: Record<string, number> = {
  'SUBMITTED': 1,
  'INTERVIEW_SCHEDULED': 2,
  'INTERVIEWING': 3,
  'APPROVED': 4,
  'REJECTED': 5,
  'WITHDRAWN': 6,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
    case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
    case 'INTERVIEW_SCHEDULED': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'INTERVIEWING': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'SUBMITTED': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  };
};

const ApplicationTimeline = ({ application, className }: ApplicationTimelineProps) => {
  // Build status history timeline from statusHistory or derive from current status
  const timelineItems: StatusHistoryItem[] = [];
  
  if (application.statusHistory && application.statusHistory.length > 0) {
    timelineItems.push(...application.statusHistory);
  } else {
    // Fallback: create basic timeline entry
    timelineItems.push({
      status: application.status,
      changedAt: application.createdAt || new Date().toISOString(),
      changedBy: application.reviewerId || 'System',
      notes: '',
    });
  }

  const sortedItems = [...timelineItems].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Status History
      </h3>

      {sortedItems.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No status history available.</p>
      ) : (
        sortedItems.map((item, index) => {
          const isLast = index === sortedItems.length - 1;
          return (
            <div key={index} className="relative pl-8">
              {/* Timeline connector */}
              {!isLast && (
                <div className="absolute left-3 top-10 bottom-0 w-px bg-gray-200"></div>
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 bg-white z-10">
                <div className="w-3 h-3 rounded-full mx-auto mt-3 {getStatusColor(item.status)}"></div>
              </div>

              {/* Timeline item */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Changed by:</strong> {item.changedBy || 'System'}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-600 italic">
                    "{item.notes}"
                  </p>
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
