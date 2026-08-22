import React, { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { removeAttendeeV2 } from "@/features/events/api/eventService";

interface RemoveAttendeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAttendeeRemoved?: () => void;
  eventId: string;
  attendeeIdNumber: string;
  attendeeName: string;
}

export const RemoveAttendeeModal: React.FC<RemoveAttendeeModalProps> = ({
  open,
  onOpenChange,
  onAttendeeRemoved,
  eventId,
  attendeeIdNumber,
  attendeeName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await removeAttendeeV2(eventId, attendeeIdNumber);

      if (result) {
        onAttendeeRemoved?.();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[80vh] w-full max-w-md flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-md sm:rounded-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex-none border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl leading-6 font-semibold">
              Remove Attendee
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCancel}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Attendee info */}
            <div className="rounded-xl border px-4 py-3">
              <p className="text-muted-foreground text-xs">Removing</p>
              <p className="text-sm font-medium">{attendeeName}</p>
              <p className="text-muted-foreground font-mono text-xs">
                {attendeeIdNumber}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <p className="text-xs leading-relaxed text-red-900">
                This permanently deletes the attendee's registration and
                attendance record for this event. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background flex flex-none items-center justify-end gap-3 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Attendee"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
