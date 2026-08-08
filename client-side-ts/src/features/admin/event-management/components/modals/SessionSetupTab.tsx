import { Sunrise, Sun, Sunset } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormData } from "./AddEventModal";


interface SessionSetupTabProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
}

interface SessionField {
  key: "morning" | "afternoon" | "evening";
  label: string;
  icon?: React.ReactNode;
}

const SESSION_FIELDS: SessionField[] = [
  { key: "morning", label: "Morning Session", icon: <Sunrise className="h-5 w-5 text-[#1C9DDE]" aria-hidden="true" /> },
  { key: "afternoon", label: "Afternoon Session", icon: <Sun className="h-5 w-5 text-[#1C9DDE]" aria-hidden="true" /> },
  { key: "evening", label: "Evening Session", icon: <Sunset className="h-5 w-5 text-[#1C9DDE]" aria-hidden="true" /> },
];

const formatDateLabel = (date?: Date): string => {
  if (!date || Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
};

export const SessionSetupTab: React.FC<SessionSetupTabProps> = ({
  formData,
  setFormData,
}) => {
  const selectedDateLabel = formatDateLabel(formData.eventSchedule?.from);

  const updateRange = (
    sessionKey: SessionField["key"],
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const current = formData.sessionConfig[sessionKey];
    const [, end] = current.timeRange.split(" - ");
    const [start] = current.timeRange.split(" - ");

    const range =
      field === "startTime"
        ? `${value} - ${end || "12:00"}`
        : `${start || "07:30"} - ${value}`;

    setFormData((prev) => ({
      ...prev,
      sessionConfig: {
        ...prev.sessionConfig,
        [sessionKey]: { ...current, timeRange: range },
      },
    }));
  };

  const toggleEnabled = (sessionKey: SessionField["key"], enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sessionConfig: {
        ...prev.sessionConfig,
        [sessionKey]: { ...prev.sessionConfig[sessionKey], enabled },
      },
    }));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure attendance windows for <strong>{selectedDateLabel}</strong>.
        At least one session must be enabled with a valid 24-hour time range.
      </p>

      {SESSION_FIELDS.map((session) => {
        const field = formData.sessionConfig[session.key];
        const [startTime = "", endTime = ""] = field.timeRange.split(" - ");

        return (
          <section
            key={session.key}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={`session-${session.key}`}
                checked={field.enabled}
                onCheckedChange={(checked) =>
                  toggleEnabled(session.key, checked === true)
                }
                className="data-[state=checked]:bg-[#1C9DDE]"
              />
              {session.icon}
              <Label htmlFor={`session-${session.key}`} className="cursor-pointer">
                {session.label}
              </Label>
            </div>

            {field.enabled && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${session.key}-start`} className="mb-2 block text-xs text-muted-foreground">
                    Start
                  </Label>
                  <Input
                    id={`${session.key}-start`}
                    type="time"
                    step="60"
                    value={startTime}
                    onChange={(event) =>
                      updateRange(session.key, "startTime", event.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`${session.key}-end`} className="mb-2 block text-xs text-muted-foreground">
                    End
                  </Label>
                  <Input
                    id={`${session.key}-end`}
                    type="time"
                    step="60"
                    value={endTime}
                    onChange={(event) =>
                      updateRange(session.key, "endTime", event.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
