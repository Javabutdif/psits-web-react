import { useState } from "react";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/TimePicker";
import type { ScheduleInterviewValues } from "../types/Recruitment.types";

const OFFICER_OPTIONS = [
  "President",
  "Vice President - Internal",
  "Vice President - External",
  "Treasurer",
  "Asst. Treasurer",
  "Auditor",
  "Secretary",
  "Chief Volunteer",
  "PRO",
  "Devs",
];

const INTERVIEW_TYPE_OPTIONS = ["Online", "Face-to-Face"];

function formatDateDisplay(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Convert "HH:mm" (24h) to minutes since midnight for reliable comparison.
function timeToMinutes(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

interface OfficerMultiSelectPopoverProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

function OfficerMultiSelectPopover({
  value,
  onChange,
  options,
}: OfficerMultiSelectPopoverProps) {
  const [open, setOpen] = useState(false);

  const toggle = (officer: string) => {
    if (value.includes(officer)) {
      onChange(value.filter((o) => o !== officer));
    } else {
      onChange([...value, officer]);
    }
  };

  const label =
    value.length === 0
      ? "Officer"
      : value.length === 1
        ? value[0]
        : `${value.length} officers selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-lg border border-[#ececec] px-3 text-sm text-slate-700"
        >
          <span className={value.length === 0 ? "text-slate-400" : "truncate"}>
            {label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 rounded-2xl p-2" align="start">
        <div
          className="max-h-56 space-y-0.5 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Checkbox
                checked={value.includes(o)}
                onCheckedChange={() => toggle(o)}
              />
              {o}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface InterviewSchedulingModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (values: ScheduleInterviewValues) => void;
}

export const InterviewSchedulingModal = ({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: InterviewSchedulingModalProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [officers, setOfficers] = useState<string[]>([]);
  const [interviewType, setInterviewType] = useState("");
  const [saveSelection, setSaveSelection] = useState(false);

  const isValid =
    date && startTime && endTime && officers.length > 0 && interviewType;

  const handleConfirm = () => {
    if (!isValid || !date) return;
    onConfirm({
      date: date.toISOString().slice(0, 10),
      startTime,
      endTime,
      officer: officers.join(", "),
      interviewType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex max-h-[95vh] w-[95vw] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:w-full sm:!max-w-3xl md:max-h-[101vh] [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="relative flex items-center justify-center px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Interview Scheduling
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-4 md:grid-cols-2">
          {/* Left: calendar */}
          <div>
            <Label className="mb-1 block text-xs font-medium">
              Select Date &amp; Time
            </Label>
            <div className="rounded-2xl border border-[#ececec] p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Right: date/time + officer + type + save selection */}
          <div className="space-y-4">
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <div className="mt-7 flex h-9 items-center rounded-lg border border-[#ececec] pl-9 text-sm text-slate-700">
                {formatDateDisplay(date) || (
                  <span className="text-slate-400">Date</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TimePicker
                value={startTime}
                placeholder="From"
                onChange={(v) => {
                  setStartTime(v);
                  if (endTime && timeToMinutes(endTime) <= timeToMinutes(v)) {
                    setEndTime("");
                  }
                }}
              />

              <span className="shrink-0 text-sm text-slate-500">to</span>

              <TimePicker
                value={endTime}
                placeholder="To"
                onChange={setEndTime}
              />
            </div>

            <div>
              <Label className="mb-1.5 block overflow-y-auto text-xs font-medium">
                Officer In-charge
              </Label>
              <OfficerMultiSelectPopover
                value={officers}
                onChange={setOfficers}
                options={OFFICER_OPTIONS}
              />
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
              Save Selection <span className="text-red-500">*</span>
            </label>
          </div>
        </div>

        <div className="flex justify-center px-6 py-6">
          <Button
            type="button"
            disabled={!isValid || isSubmitting}
            className="h-9 w-48 rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
            onClick={handleConfirm}
          >
            {isSubmitting ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulingModal;
