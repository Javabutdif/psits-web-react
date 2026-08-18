import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  // Controls the calendar panel open state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Tracks whether we're below the `sm` breakpoint — drives whether the
  // calendar renders at the trigger-relative position (desktop) or
  // centered on screen with larger cells (mobile).
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const PANEL_WIDTH = 300;
  const PANEL_MARGIN = 16; // keep some breathing room from screen edges

  // Root wrapper of this tab — used to compute where the panel should
  // land on screen, since it's portaled out to escape the modal's
  // scroll-clipping container.
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [panelPos, setPanelPos] = useState({
    top: 0,
    left: 0,
    width: PANEL_WIDTH,
  });

  const updatePanelPosition = () => {
    if (!rootRef.current || isMobile) return;
    const rect = rootRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const effectiveWidth = Math.min(
      PANEL_WIDTH,
      viewportWidth - PANEL_MARGIN * 2
    );

    let left = rect.right - effectiveWidth;
    left = Math.max(
      PANEL_MARGIN,
      Math.min(left, viewportWidth - effectiveWidth - PANEL_MARGIN)
    );

    const estimatedPanelHeight = panelRef.current?.offsetHeight ?? 420;
    let top = rect.top;
    top = Math.max(
      PANEL_MARGIN,
      Math.min(top, viewportHeight - estimatedPanelHeight - PANEL_MARGIN)
    );

    setPanelPos({ top, left, width: effectiveWidth });
  };

  useLayoutEffect(() => {
    if (isCalendarOpen) updatePanelPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarOpen, isMobile]);

  useEffect(() => {
    if (!isCalendarOpen || isMobile) return;
    // Recalculate on scroll/resize so the panel stays pinned to the
    // same visual spot even as the modal body scrolls internally.
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);
    return () => {
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarOpen, isMobile]);

  useEffect(() => {
    if (!isCalendarOpen) return;
    // A real backdrop <div> gets intercepted by the parent Dialog's own
    // "click outside closes the dialog" handling, since our backdrop is
    // technically outside Dialog.Content too. A document-level listener
    // in the capture phase runs independently of Radix's interception,
    // so it reliably closes just our panel instead.
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isCalendarOpen]);

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
    <div ref={rootRef} className="relative flex h-full flex-col gap-6">
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
        <div className="sm:col--2 flex min-w-0 flex-col gap-2">
          <Label className="text-sm font-medium">Event Schedule</Label>

          {/* Single trigger field — just opens the panel, position is
              fixed within the modal, not tied to this button's location */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className={cn(
              "flex h-11 w-full items-center gap-2 rounded-xl border px-4 text-left text-sm transition-colors sm:w-60",
              isCalendarOpen
                ? "border-[#1C9DDE] ring-1 ring-[#1C9DDE]"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
            <span
              className={cn(
                "truncate",
                !formData.eventSchedule?.from && "text-muted-foreground"
              )}
            >
              {formData.eventSchedule?.from
                ? formData.eventSchedule?.to
                  ? `${format(formData.eventSchedule.from, "d MMM yyyy")} - ${format(formData.eventSchedule.to, "d MMM yyyy")}`
                  : format(formData.eventSchedule.from, "d MMM yyyy")
                : "Choose date"}
            </span>
          </button>
        </div>

        {/* Calendar panel — portaled to document.body.
            Desktop: `fixed` coordinates computed from the root wrapper's
            on-screen location, clamped to stay within the viewport.
            Mobile (<640px): centered on screen with a dimmed backdrop and
            larger day cells for easier tapping. */}
        {isCalendarOpen &&
          createPortal(
            <>
              {/* Backdrop, mobile only — dims content behind the panel */}
              {isMobile && (
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setIsCalendarOpen(false)}
                />
              )}

              <div
                ref={panelRef}
                style={
                  isMobile
                    ? undefined
                    : {
                        top: panelPos.top,
                        left: panelPos.left,
                        width: panelPos.width,
                      }
                }
                className={cn(
                  "pointer-events-auto fixed z-50 overflow-y-auto border border-gray-200 bg-white shadow-lg",
                  isMobile
                    ? "top-1/2 left-1/2 max-h-[85vh] w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5"
                    : "max-h-[520px] rounded-2xl p-4"
                )}
              >
                {/* Plain pill fields — no dashed borders, no "+" icons */}
                <div className="mb-1 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-full border border-gray-200 text-sm",
                      isMobile ? "h-9" : "h-9 px-3"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !formData.eventSchedule?.from && "text-muted-foreground"
                      )}
                    >
                      {formData.eventSchedule?.from
                        ? format(formData.eventSchedule.from, "d MMM yyyy")
                        : "Start date"}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-full border border-gray-200 text-sm",
                      isMobile ? "h-9" : "h-7 px-3"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !formData.eventSchedule?.to && "text-muted-foreground"
                      )}
                    >
                      {formData.eventSchedule?.to
                        ? format(formData.eventSchedule.to, "d MMM yyyy")
                        : "End date"}
                    </span>
                  </div>
                </div>

                {/* Calendar — bigger cells on mobile for easier tapping */}
                <Calendar
                  mode="range"
                  selected={formData.eventSchedule}
                  onSelect={(range) =>
                    setFormData((prev) => ({ ...prev, eventSchedule: range }))
                  }
                  initialFocus
                  classNames={
                    isMobile
                      ? {
                          day: "h-12 w-11 text-sm rounded-full",
                          day_selected:
                            "h-12 w-11 text-sm rounded-full bg-[#1C9DDE] text-white",

                          cell: "w-11 h-10 p-0",

                          head_cell: "w-11 text-center text-xs",

                          caption_label: "text-base font-semibold",

                          row: "flex w-fit mx-auto mt-1.5",

                          head_row: "flex w-fit mx-auto",
                        }
                      : {
                          day: "h-8 w-8 rounded-full text-xs",
                          day_selected:
                            "h-8 w-8 rounded-full bg-[#1C9DDE] text-white",

                          cell: "w-8 h-10 p-0",

                          head_cell:
                            "w-8 text-center text-[10px] text-gray-400",

                          caption_label: "text-sm font-semibold",

                          row: "flex w-fit mx-auto",

                          head_row: "flex w-fit mx-auto",

                          day_range_middle:
                            "bg-[#1C9DDE]/10 text-[#0879B5] rounded-none",

                          day_range_start: "rounded-full",

                          day_range_end: "rounded-full",
                        }
                  }
                />

                <div className="mt-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        eventSchedule: undefined,
                      }));
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}

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
              className="h-11 w-full min-w-0 rounded-xl border-gray-200 pl-9 text-sm focus-visible:border-[#1C9DDE] focus-visible:ring-1 focus-visible:ring-[#1C9DDE]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
