import { useState } from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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

interface TimePickerProps {
  /** 24-hour time string, e.g. "07:30". Empty string = unset. */
  value: string;
  /** Fires with a 24-hour time string, e.g. "07:30". */
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  id,
}: TimePickerProps) {
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
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-fit items-center gap-1.5 rounded-full border border-[#ececec] px-3.5 text-sm text-slate-700",
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {value ? (
            formatTime12h(value)
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 overflow-y-auto rounded-2xl p-5"
        align="start"
      >
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
