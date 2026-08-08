import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Calendar as CalendarIcon,
  MapPin,
  Camera,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { EventFormData } from "./AddEventModal";

interface EventInfoTabProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  initialImage?: string;
  isEdit?: boolean;
}

export const EventInfoTab: React.FC<EventInfoTabProps> = ({
  formData,
  setFormData,
  initialImage,
  isEdit = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Top row - Image + Name/Description */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column - Image Upload */}
        <div className="flex min-w-0 flex-col">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-4xl border-2 border-dashed transition-colors",
              isEdit && "max-h-[220px]",
              isDraggingOver
                ? "border-[#1C9DDE] bg-[#1C9DDE]/5"
                : "border-gray-300 bg-white"
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt={formData.eventName || "Event image"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/30"
                >
                  <div className="rounded-full bg-black/40 p-2">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <UploadCloud className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Uploading a new image will replace the current one
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 cursor-pointer rounded-full"
                >
                  Browse File
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* Right Column - Name + Description */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Event Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="eventName" className="text-sm font-medium">
              Event Name
            </Label>
            <Input
              id="eventName"
              placeholder="Enter event name"
              value={formData.eventName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventName: e.target.value }))
              }
              className="w-full"
            />
          </div>

          {/* Event Description */}
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="eventDescription" className="text-sm font-medium">
              Event Description
            </Label>
            <Textarea
              id="eventDescription"
              placeholder="Enter event description"
              value={formData.eventDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  eventDescription: e.target.value,
                }))
              }
              className="max-h-[130px] min-h-[100px] w-full resize-none overflow-y-auto"
            />
          </div>
        </div>
      </div>

      {/* Bottom row - Event Schedule + Location, spans full width */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <Label className="text-sm font-medium">Event Schedule</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full min-w-0 justify-start overflow-hidden rounded-lg border-gray-200 text-left font-normal shadow-sm",
                  !formData.eventSchedule?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">
                  {formData.eventSchedule?.from ? (
                    formData.eventSchedule.to ? (
                      <>
                        {format(formData.eventSchedule.from, "d MMM yyyy")} -{" "}
                        {format(formData.eventSchedule.to, "d MMM yyyy")}
                      </>
                    ) : (
                      format(formData.eventSchedule.from, "d MMM yyyy")
                    )
                  ) : (
                    "Choose date range"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={formData.eventSchedule}
                onSelect={(range) =>
                  setFormData((prev) => ({ ...prev, eventSchedule: range }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="eventVenue" className="text-sm font-medium">
            Location
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="eventVenue"
              placeholder="e.g. University of Cebu Main Campus"
              value={formData.eventVenue || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  eventVenue: e.target.value,
                }))
              }
              className="w-full min-w-0 rounded-lg border-gray-200 pl-9 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
