import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventInfoTab } from "./EventInfoTab";
import { SessionSetupTab } from "./SessionSetupTab";
import type { EventFormData } from "./AddEventModal";
import { showToast } from "@/utils/alertHelper";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveEvent?: (event: unknown) => void;
  eventData: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    startDate?: string;
    image: string;
  } | null;
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
  void onSaveEvent;

  const [activeTab, setActiveTab] = useState("event-info");

  const formData: EventFormData = useMemo(() => {
    if (!eventData || !open) {
      return {
        eventName: "",
        eventDescription: "",
        eventSchedule: undefined,
        attendanceType: "open",
        image: null,
        sessionConfig: defaultDisabledSessions,
      };
    }

    return {
      eventName: eventData.title || "",
      eventDescription: eventData.description || "",
      eventSchedule: eventData.startDate ? new Date(eventData.startDate) : undefined,
      attendanceType: "open",
      image: null,
      sessionConfig: defaultDisabledSessions,
    };
  }, [eventData, open]);

  const handleCancel = () => {
    setActiveTab("event-info");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    showToast("info", "Editing will move to V2 next");
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
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <TabsContent value="event-info" className="mt-0 h-full">
              <EventInfoTab formData={formData} setFormData={() => {}} />
            </TabsContent>

            <TabsContent value="session-setup" className="mt-0 h-full">
              <SessionSetupTab formData={formData} setFormData={() => {}} />
            </TabsContent>
          </div>

          <div className="bg-background flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button variant="outline" onClick={handleCancel} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="cursor-pointer bg-[#1C9DDE] hover:bg-[#1C9DDE]"
              disabled
              title="V2 edit endpoint not yet available"
            >
              Save Changes (coming soon)
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
