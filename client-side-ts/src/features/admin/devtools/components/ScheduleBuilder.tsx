import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleBuilderProps {
  value: {
    type: string;
    time: string;
    intervalDays?: number;
    dayOfWeek?: number;
    cronExpression?: string;
  };
  onChange: (value: ScheduleBuilderProps["value"]) => void;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const ScheduleBuilder = ({ value, onChange }: ScheduleBuilderProps) => {
  const scheduleType = value.type as "daily" | "interval" | "weekly" | "cron";

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium text-[#555]">Schedule Type</Label>
        <Select
          value={scheduleType}
          onValueChange={(v) => onChange({ ...value, type: v, intervalDays: undefined, dayOfWeek: undefined, cronExpression: undefined })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="interval">Every N Days</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="cron">Custom Cron</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium text-[#555]">Time (Asia/Manila)</Label>
        <Input
          type="time"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          className="mt-1"
        />
      </div>

      {scheduleType === "interval" && (
        <div>
          <Label className="text-xs font-medium text-[#555]">Every N Days</Label>
          <Input
            type="number"
            min={1}
            max={365}
            value={value.intervalDays ?? 1}
            onChange={(e) => onChange({ ...value, intervalDays: parseInt(e.target.value) || 1 })}
            className="mt-1"
          />
        </div>
      )}

      {scheduleType === "weekly" && (
        <div>
          <Label className="text-xs font-medium text-[#555]">Day of Week</Label>
          <Select
            value={String(value.dayOfWeek ?? 0)}
            onValueChange={(v) => onChange({ ...value, dayOfWeek: parseInt(v) })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {scheduleType === "cron" && (
        <div>
          <Label className="text-xs font-medium text-[#555]">Cron Expression</Label>
          <Input
            type="text"
            placeholder="e.g., 0 9 * * *"
            value={value.cronExpression ?? ""}
            onChange={(e) => onChange({ ...value, cronExpression: e.target.value })}
            className="mt-1 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Format: minute hour day month weekday
          </p>
        </div>
      )}

      <div className="rounded-lg bg-[#f0f7fc] p-3">
        <p className="text-xs font-medium text-[#1c9dde]">Schedule Preview</p>
        <p className="mt-1 text-xs text-[#555]">{getPreview(value)}</p>
      </div>
    </div>
  );
};

const getPreview = (value: ScheduleBuilderProps["value"]) => {
  const time = value.time || "00:00";
  switch (value.type) {
    case "daily":
      return `Daily at ${time} (Asia/Manila)`;
    case "interval":
      return `Every ${value.intervalDays ?? 1} day(s) at ${time}`;
    case "weekly": {
      const day = DAYS.find((d) => d.value === value.dayOfWeek);
      return `Weekly on ${day?.label ?? "Sunday"} at ${time}`;
    }
    case "cron":
      return `Cron: ${value.cronExpression ?? "not set"}`;
  }
};
