import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScheduleInterviewValues } from "../types/Recruitment.types";

// TODO: replace with a real admin/officer list (e.g. an admin lookup endpoint).
const OFFICER_OPTIONS = ["Officer A", "Officer B", "Officer C"];

// TODO: confirm the actual set of interview types your backend expects.
const INTERVIEW_TYPE_OPTIONS = ["Online", "Face-to-Face", "Phone Call"];

interface InterviewSchedulingDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (values: ScheduleInterviewValues) => void;
}

export const InterviewSchedulingDialog = ({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: InterviewSchedulingDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [officer, setOfficer] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [saveSelection, setSaveSelection] = useState(false);

  const isValid = date && startTime && endTime && officer && interviewType;

  const handleConfirm = () => {
    if (!isValid || !date) return;
    onConfirm({
      date: date.toISOString().slice(0, 10),
      startTime,
      endTime,
      officer,
      interviewType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg gap-0 rounded-3xl p-0 [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Interview Scheduling
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <Label className="mb-2 block text-xs font-medium">
              Select Date &amp; Time
            </Label>
            <div className="rounded-xl border border-[#ececec] p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">From</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 rounded-lg border-[#ececec]"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">To</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 rounded-lg border-[#ececec]"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium">
              Officer In-charge
            </Label>
            <Select value={officer} onValueChange={setOfficer}>
              <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                <SelectValue placeholder="Officer" />
              </SelectTrigger>
              <SelectContent>
                {OFFICER_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium">
              Interview Type
            </Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                <SelectValue placeholder="Interview Type" />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={saveSelection}
              onCheckedChange={(v) => setSaveSelection(Boolean(v))}
            />
            Save Selection
          </label>
        </div>

        <div className="flex justify-center border-t border-[#f0f0f0] px-6 py-5">
          <Button
            type="button"
            disabled={!isValid || isSubmitting}
            className="h-9 w-full rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
            onClick={handleConfirm}
          >
            {isSubmitting ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulingDialog;
