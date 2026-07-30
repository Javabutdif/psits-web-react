import { useState } from "react";
import { CalendarIcon, Clock, X } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import type { ScheduleInterviewValues } from "../types/Recruitment.types";

// TODO: replace with a real admin/officer list (e.g. an admin lookup endpoint).
const OFFICER_OPTIONS = [
  "President",
  "Vice President - Internal",
  "Vice President - External",
  "Secretary",
];

const INTERVIEW_TYPE_OPTIONS = ["Online", "Face-to-Face"];

function formatTime12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// Parse a "HH:mm" (24h) string into 12h-clock parts.
function parseTime24(time24: string) {
  if (!time24) return null;
  const [h, m] = time24.split(":").map(Number);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute: m, period };
}

// Build a "HH:mm" (24h) string from 12h-clock parts.
function toTime24(hour12: number, minute: number, period: "AM" | "PM") {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDateDisplay(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface TimePickerPopoverProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function TimePickerPopover({
  value,
  onChange,
  placeholder,
}: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const parsed = parseTime24(value);
  const hour12 = parsed?.hour12 ?? 7;
  const minute = parsed?.minute ?? 0;
  const period = parsed?.period ?? "AM";

  const commit = (h: number, m: number, p: "AM" | "PM") => {
    onChange(toTime24(h, m, p));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-fit items-center gap-1.5 rounded-full border border-[#ececec] px-3.5 text-sm text-slate-700"
        >
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {value ? (
            formatTime12h(value)
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 rounded-2xl p-5" align="start">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-1 xl font-medium text-slate-900">
            {String(hour12).padStart(2, "0")}:{String(minute).padStart(2, "0")}{" "}
            {period}
          </span>
          <div className="flex gap-2">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => commit(hour12, minute, p)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-[#1c9dde] text-white"
                    : "border border-[#ececec] text-slate-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm text-slate-700">Hour</Label>
            <span className="rounded-lg border border-[#ececec] px-3 py-1 text-sm font-medium text-[#1c9dde]">
              {String(hour12).padStart(2, "0")}
            </span>
          </div>
          <Slider
            value={[hour12]}
            min={1}
            max={12}
            step={1}
            onValueChange={([h]) => commit(h, minute, period)}
          />
          <div className="mt-1.5 flex justify-between text-xs text-slate-400">
            <span>01</span>
            <span>06</span>
            <span>12</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm text-slate-700">Minutes</Label>
            <span className="rounded-lg border border-[#ececec] px-3 py-1 text-sm font-medium text-[#1c9dde]">
              {String(minute).padStart(2, "0")}
            </span>
          </div>
          <Slider
            value={[minute]}
            min={0}
            max={59}
            step={1}
            onValueChange={([m]) => commit(hour12, m, period)}
          />
          <div className="mt-1.5 flex justify-between text-xs text-slate-400">
            <span>00</span>
            <span>30</span>
            <span>59</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
        className="!max-w-3xl gap-0 rounded-3xl p-0 [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="relative flex items-center justify-center border-b border-[#f0f0f0] px-6 py-5">
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

        <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2">
          {/* Left: calendar */}
          <div>
            <Label className="mb-2 block text-xs font-medium">
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
              <div className="mt-7 flex h-9 items-center rounded-lg pl-9 text-sm text-slate-700">
                {formatDateDisplay(date) || (
                  <span className="text-slate-400">Date</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TimePickerPopover
                value={startTime}
                placeholder="From"
                onChange={(v) => {
                  setStartTime(v);
                  // Clear an end time that's no longer after the new start
                  if (endTime && endTime <= v) setEndTime("");
                }}
              />

              <span className="shrink-0 text-sm text-slate-500">to</span>

              <TimePickerPopover
                value={endTime}
                placeholder="To"
                onChange={setEndTime}
              />
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

export default InterviewSchedulingDialog;
