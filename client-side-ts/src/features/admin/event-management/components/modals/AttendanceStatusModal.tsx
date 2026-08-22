import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface AttendanceSession {
  attended?: boolean;
  timestamp?: string | Date | null;
}

interface AttendanceRecord {
  morning?: AttendanceSession;
  afternoon?: AttendanceSession;
  evening?: AttendanceSession;
}

interface AttendanceStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendeeName: string;
  attendance?: AttendanceRecord;
  isAttendanceAvailable: boolean;
  confirmedBy?: string;
}

const SESSION_LABELS: Array<{
  key: keyof AttendanceRecord;
  label: string;
}> = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

const formatTimestamp = (value: string | Date | null | undefined): string => {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const AttendanceStatusModal: React.FC<AttendanceStatusModalProps> = ({
  open,
  onOpenChange,
  attendeeName,
  attendance,
  isAttendanceAvailable,
  confirmedBy,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Attendance Details</DialogTitle>
          <p className="text-muted-foreground text-sm">{attendeeName}</p>
        </DialogHeader>

        {!isAttendanceAvailable ? (
          <div className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
            Attendance tracking will be available during the event.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Confirmed By Section */}
            {confirmedBy && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-green-900">
                    Attendance marked by
                  </p>
                  <p className="text-sm font-medium text-green-800">
                    {confirmedBy}
                  </p>
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-3">
              {SESSION_LABELS.map((session) => {
                const record = attendance?.[session.key];
                const attended = Boolean(record?.attended);

                return (
                  <div
                    key={session.key}
                    className="bg-muted/50 flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{session.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatTimestamp(record?.timestamp)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        attended
                          ? "border-green-200 bg-green-100 text-green-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }
                    >
                      {attended ? "Attended" : "Not recorded"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
