import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventInfoTab } from "./EventInfoTab";
import { SessionSetupTab } from "./SessionSetupTab";
import type { EventFormData } from "./AddEventModal";
import { showToast } from "@/utils/alertHelper";
import { updateEventDetails } from "@/features/events/api/eventService";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveEvent?: (event: unknown) => void;
  eventData: {
    id: string;
    title: string;
    description?: string;
    eventVenue?: string;
    startDate?: string;
    image: string;
    eventTheme?: string;
    eventVenueSpecific?: string;
    eventStartTime?: string;
    eventEndTime?: string;
  } | null;
}

interface EditEventFormData extends EventFormData {
  eventVenue?: string;
  eventTheme?: string;
  eventVenueSpecific?: string;
  eventStartTime?: string;
  eventEndTime?: string;
}

const defaultDisabledSessions: EventFormData["sessionConfig"] = {
  morning: { enabled: false, timeRange: "" },
  afternoon: { enabled: false, timeRange: "" },
  evening: { enabled: false, timeRange: "" },
};

export const EditEventModal: React.FC<EditEventModalProps> = ({
  open,
  onOpenChange,
  onSaveEvent,
  eventData,
}) => {
  const [activeTab, setActiveTab] = useState("event-info");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<EditEventFormData>({
    eventName: "",
    eventDescription: "",
    eventSchedule: undefined,
    attendanceType: "open",
    image: null,
    sessionConfig: defaultDisabledSessions,
    eventVenue: "",
    eventTheme: "",
    eventVenueSpecific: "",
    eventStartTime: "",
    eventEndTime: "",
  });

  useEffect(() => {
    if (open && eventData) {
      setFormData({
        eventName: eventData.title || "",
        eventDescription: eventData.description || "",
        eventSchedule: eventData.startDate ? new Date(eventData.startDate) : undefined,
        attendanceType: "open",
        image: null,
        sessionConfig: defaultDisabledSessions,
        eventVenue: eventData.eventVenue || "",
        eventTheme: eventData.eventTheme || "",
        eventVenueSpecific: eventData.eventVenueSpecific || "",
        eventStartTime: eventData.eventStartTime || "",
        eventEndTime: eventData.eventEndTime || "",
      });
    }
  }, [eventData, open]);

  const handleCancel = () => {
    setActiveTab("event-info");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!eventData?.id) return;
    try {
      setIsSaving(true);
      const res = await updateEventDetails(eventData.id, {
        eventName: formData.eventName,
        eventDescription: formData.eventDescription,
        eventDate: formData.eventSchedule,
        eventVenue: formData.eventVenue,
        eventTheme: formData.eventTheme,
        eventVenueSpecific: formData.eventVenueSpecific,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
      });
      if (res) {
        showToast("success", "Event updated successfully");
        if (onSaveEvent) {
          onSaveEvent(res.data || res);
        }
        onOpenChange(false);
      } else {
        showToast("error", "Failed to update event");
      }
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || "Failed to update event");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-full max-w-4xl flex-col gap-0 overflow-y-auto rounded-lg p-0 sm:max-w-2xl sm:rounded-xl">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold leading-6">
              Edit Event
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent px-6 py-0">
            <TabsTrigger
              value="event-info"
              className="cursor-pointer rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-[#1C9DDE] data-[state=active]:shadow-none"
            >
              Event Info
            </TabsTrigger>
            <TabsTrigger
              value="session-setup"
              className="border-blue cursor-pointer rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-b-[#1C9DDE] data-[state=active]:bg-transparent data-[state=active]:text-[#1C9DDE] data-[state=active]:shadow-none"
            >
              Session Setup
            </TabsTrigger>
            <TabsTrigger
              value="optional-details"
              className="border-blue cursor-pointer rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-b-[#1C9DDE] data-[state=active]:bg-transparent data-[state=active]:text-[#1C9DDE] data-[state=active]:shadow-none"
            >
              Optional Details
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <TabsContent value="event-info" className="mt-0 h-full">
              <EventInfoTab formData={formData} setFormData={setFormData as any} />
            </TabsContent>

            <TabsContent value="session-setup" className="mt-0 h-full">
              <SessionSetupTab formData={formData} setFormData={setFormData as any} />
            </TabsContent>

            <TabsContent value="optional-details" className="mt-0 h-full space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Event Theme</label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Synergizing AI and Cloud Technologies"
                    value={formData.eventTheme || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTheme: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">General Venue / Location</label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. Cebu Coliseum"
                      value={formData.eventVenue || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventVenue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Specific Venue (Room/Hall)</label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. Stage Left, IT Lab 4"
                      value={formData.eventVenueSpecific || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventVenueSpecific: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Start Time</label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={formData.eventStartTime || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">End Time</label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={formData.eventEndTime || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventEndTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="bg-background flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button variant="outline" onClick={handleCancel} className="cursor-pointer" disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="cursor-pointer bg-[#1C9DDE] hover:bg-[#1C9DDE]"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
