import { useState } from "react";
import { CalendarIcon, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

import type { RecruitmentPosition } from "../types/Recruitment.types";

function formatDateDisplay(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function parseTime24(time24: string) {
  if (!time24) return null;
  const [h, m] = time24.split(":").map(Number);
  return {
    hour12: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    period: h >= 12 ? "PM" : "AM",
  } as const;
}

function toTime24(hour12: number, minute: number, period: "AM" | "PM") {
  let hour = hour12 % 12;
  if (period === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

interface TimePickerPopoverProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function TimePickerPopover({
  value,
  placeholder,
  onChange,
}: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseTime24(value);
  const hour = parsed?.hour12 ?? 7;
  const minute = parsed?.minute ?? 30;
  const period = parsed?.period ?? "AM";

  const commit = (h: number, m: number, p: "AM" | "PM") =>
    onChange(toTime24(h, m, p));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 text-sm"
        >
          <Clock className="h-4 w-4 text-slate-400" />
          {value ? (
            formatTime12h(value)
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 rounded-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-lg font-medium">
            {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}{" "}
            {period}
          </span>
          <div className="flex gap-2">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => commit(hour, minute, p)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition ${
                  p === period ? "bg-[#1C9DDE] text-white" : "border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between">
              <Label>Hour</Label>
              <span className="rounded border px-2 py-1 text-xs text-[#1C9DDE]">
                {String(hour).padStart(2, "0")}
              </span>
            </div>
            <Slider
              value={[hour]}
              min={1}
              max={12}
              step={1}
              onValueChange={([v]) => commit(v, minute, period)}
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between">
              <Label>Minutes</Label>
              <span className="rounded border px-2 py-1 text-xs text-[#1C9DDE]">
                {String(minute).padStart(2, "0")}
              </span>
            </div>
            <Slider
              value={[minute]}
              min={0}
              max={59}
              step={1}
              onValueChange={([v]) => commit(hour, v, period)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface DateInputProps {
  value?: Date;
  placeholder: string;
  active?: boolean;
}

function DateInput({ value, placeholder, active }: DateInputProps) {
  return (
    <div className="relative">
      <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <div
        className={`flex h-10 cursor-pointer items-center rounded-lg border pr-3 pl-10 text-sm transition ${
          active ? "border-[#1C9DDE] ring-1 ring-[#1C9DDE]" : "border-[#E5E7EB]"
        }`}
      >
        {value ? (
          formatDateDisplay(value)
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
      </div>
    </div>
  );
}

export interface PositionEditValues {
  title: string;
  slots?: number;
  applicationDeadline: string;
  requirements: string[];
}

interface PositionEditModalProps {
  open: boolean;
  isSubmitting: boolean;
  position: RecruitmentPosition | null;
  onClose: () => void;
  onConfirm: (data: PositionEditValues) => void;
}

export default function PositionEditModal({
  open,
  isSubmitting,
  position,
  onClose,
  onConfirm,
}: PositionEditModalProps) {
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState<number | "">("");
  const [deadlineDate, setDeadlineDate] = useState<Date>();
  const [deadlineTime, setDeadlineTime] = useState("");
  const [requirements, setRequirements] = useState("");

  // Track which position's data is currently loaded into the form so we can
  // re-sync when a *different* position is passed in. Adjusting state during
  // render (rather than in a useEffect) avoids the extra "commit, then
  // re-render" pass that react-hooks/set-state-in-effect warns about —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [loadedPositionId, setLoadedPositionId] = useState<string | null>(null);

  if (position && position._id !== loadedPositionId) {
    setLoadedPositionId(position._id);
    setTitle(position.title);
    setSlots(position.slots ?? "");
    setRequirements((position.requirements ?? []).join("\n"));

    const existing = position.applicationDeadline
      ? new Date(position.applicationDeadline)
      : undefined;
    setDeadlineDate(existing);
    setDeadlineTime(
      existing
        ? `${String(existing.getHours()).padStart(2, "0")}:${String(
            existing.getMinutes()
          ).padStart(2, "0")}`
        : ""
    );
  } else if (!position && loadedPositionId !== null) {
    // Dialog closed / cleared — reset so the next position opened re-syncs.
    setLoadedPositionId(null);
    setTitle("");
    setSlots("");
    setDeadlineDate(undefined);
    setDeadlineTime("");
    setRequirements("");
  }

  const isValid = Boolean(title.trim() && deadlineDate && deadlineTime);

  const handleConfirm = () => {
    if (!isValid || !deadlineDate) return;

    const combined = new Date(deadlineDate);
    const [h, m] = deadlineTime.split(":").map(Number);
    combined.setHours(h, m, 0, 0);

    onConfirm({
      title: title.trim(),
      slots: slots === "" ? undefined : Number(slots),
      applicationDeadline: combined.toISOString(),
      requirements: requirements
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex max-h-[95vh] w-[95vw] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:w-full sm:!max-w-3xl md:max-h-[101vh] [&>button]:hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="relative flex flex-none items-center justify-center py-5">
          <h2 className="text-lg font-semibold">Edit Position</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 rounded-full p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 px-4 py-6 md:-mt-4 md:grid-cols-2 md:gap-8 md:px-7">
            {/* LEFT SIDE */}
            <div>
              <Label className="mb-3 block font-medium">Select Date</Label>

              <div className="rounded-2xl border border-[#ECECEC] p-3">
                <Calendar
                  mode="single"
                  selected={deadlineDate}
                  onSelect={(d) => d && setDeadlineDate(d)}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-4 md:mt-7">
              <div className="relative">
                <Label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-medium text-slate-400">
                  Position Title
                </Label>
                <Input
                  value={title}
                  disabled
                  readOnly
                  className="cursor-not-allowed border-[#ECECEC] bg-white text-slate-500 disabled:opacity-100"
                />
              </div>

              <div>
                <Label className="mb-2 block font-medium">Slots</Label>
                <Input
                  type="number"
                  min={0}
                  value={slots}
                  onChange={(e) =>
                    setSlots(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Number of slots"
                />
              </div>

              <div>
                <Label className="mb-2 block font-medium">Deadline</Label>
                <div className="space-y-3">
                  <DateInput
                    value={deadlineDate}
                    placeholder="End Date"
                    active
                  />

                  <TimePickerPopover
                    value={deadlineTime}
                    placeholder="End Time"
                    onChange={setDeadlineTime}
                  />
                </div>
              </div>

              {/* ROLE REQUIREMENTS — small, scrolls internally */}
              <div>
                <Label className="mb-2 block font-medium">
                  Role Requirements
                </Label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="One requirement per line, e.g.&#10;BSIT&#10;3rd year&#10;Officer"
                  className="h-16 w-full resize-none overflow-y-auto rounded-xl border border-[#ECECEC] p-2 text-[13px] text-[#4A4A4A] placeholder:text-slate-400 focus:ring-1 focus:ring-[#1C9DDE] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-none justify-center border-t border-[#F1F1F1] py-6">
          <Button
            disabled={!isValid || isSubmitting}
            onClick={handleConfirm}
            className={`h-10 w-56 rounded-full transition-all ${
              isValid ? "bg-[#1C9DDE] hover:bg-[#1487C2]" : "bg-slate-300"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
