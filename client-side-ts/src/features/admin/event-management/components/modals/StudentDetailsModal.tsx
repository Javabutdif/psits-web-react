import React from "react";
import { X, Pencil, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status?: string;
    courseYear: string;
    campus?: string;
    shirtSize?: string;
    shirtPrice?: string;
    isPresent?: boolean;
  } | null;
  showEditActions?: boolean;
  onEditAttendee?: () => void;
  onChangePassword?: () => void;
}

const DetailRow = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span
      className={`max-w-[60%] text-right text-sm font-medium break-words ${
        valueClassName ?? ""
      }`}
    >
      {value}
    </span>
  </div>
);

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  open,
  onOpenChange,
  student,
  showEditActions = false,
  onEditAttendee,
  onChangePassword,
}) => {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="mx-auto w-[92%] max-w-md gap-0 rounded-lg p-0 sm:w-full sm:max-w-sm sm:rounded-xl md:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Student Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-6">
          {student.status && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground text-sm">Status</span>
              <Badge variant="outline">{student.status}</Badge>
            </div>
          )}

          {student.isPresent !== undefined && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground text-sm">Attendance</span>
              <Badge
                variant="outline"
                className={
                  student.isPresent
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              >
                {student.isPresent ? "Present" : "Absent"}
              </Badge>
            </div>
          )}

          <DetailRow label="Student ID" value={student.studentId} />
          <DetailRow label="Name" value={student.name} />
          <DetailRow label="Course & Year" value={student.courseYear} />

          {student.campus && (
            <DetailRow label="Campus" value={student.campus} />
          )}
          {student.shirtSize && (
            <DetailRow label="Shirt Size" value={student.shirtSize} />
          )}
          {student.shirtPrice && (
            <DetailRow
              label="Shirt Price"
              value={`PHP ${student.shirtPrice}`}
              valueClassName="text-[#1C9DDE]"
            />
          )}

          {showEditActions && (
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onEditAttendee}
                className="flex-1 cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Attendee
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onChangePassword}
                className="flex-1 cursor-pointer"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
