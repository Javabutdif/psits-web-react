import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { configureEventCertificate, getActiveTemplates } from "../api/certificate.api";
import { showToast } from "@/utils/alertHelper";
import type { Event } from "../../events/types/event.types";
import type { ICertificateTemplate } from "../types/certificate.types";

interface ConfigureEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
  availableEvents: Event[];
}

export const ConfigureEventDialog: React.FC<ConfigureEventDialogProps> = ({
  isOpen,
  onClose,
  onConfigured,
  availableEvents,
}) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ICertificateTemplate[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        try {
          const res = await getActiveTemplates();
          if (res.success) {
            setTemplates(res.templates);
          }
        } catch (error) {
          console.error("Failed to fetch templates:", error);
        }
      };
      fetchTemplates();
      
      // Reset selections when opened
      setSelectedEventId("");
      setSelectedTemplateId("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedTemplateId) {
      showToast("error", "Please select both an event and a template.");
      return;
    }

    try {
      setLoading(true);
      const res = await configureEventCertificate(selectedEventId, selectedTemplateId);
      if (res.success) {
        showToast("success", "Certificates enabled for event successfully!");
        onConfigured();
        onClose();
      } else {
        showToast("error", res.message || "Failed to configure event.");
      }
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Certificate Generation for Event</DialogTitle>
          <DialogDescription>
            Select an event and assign a certificate template to it. Once assigned, you can manage eligible students for the event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Event</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No events available</div>
                  ) : (
                    availableEvents.map((event) => {
                      const id = String(event.eventId || event._id || "");
                      return (
                        <SelectItem key={id} value={id}>
                          {event.eventName}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Certificate Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No active templates found</div>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Enable Certificates"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
