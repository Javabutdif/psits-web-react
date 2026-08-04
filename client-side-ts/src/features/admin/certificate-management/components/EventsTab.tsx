import React, { useEffect, useState } from "react";
import { getAllEventsRaw } from "../../../events/api/eventService";
import { getEventsWithCertificates } from "../../../certificate/api/certificate.api";
import type { Event } from "../../../events/types/event.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import { ConfigureEventDialog } from "./ConfigureEventDialog";
import { Plus } from "lucide-react";

interface EventsTabProps {
  onEventSelect: (eventId: string) => void;
}

const getEventImageSrc = (event: any): string | undefined => {
  if (Array.isArray(event.eventImage) && event.eventImage.length > 0) {
    return event.eventImage[0];
  }
  if (typeof event.eventImage === "string" && event.eventImage.trim() !== "") {
    return event.eventImage;
  }
  return undefined;
};

const EventCardSkeleton: React.FC = () => (
  <Card className="flex flex-col overflow-hidden">
    <Skeleton className="h-40 w-full rounded-none" />
    <CardHeader>
      <Skeleton className="mb-2 h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
  </Card>
);

export const EventsTab: React.FC<EventsTabProps> = ({ onEventSelect }) => {
  const { canManageCertificates } = useAdminPermissions();
  const [eventsWithCert, setEventsWithCert] = useState<any[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allEvents, certEventsRes] = await Promise.all([
        getAllEventsRaw(),
        getEventsWithCertificates(),
      ]);

      if (allEvents !== false) {
        const certEventIds = new Set(
          certEventsRes.events.map((e: any) => e.eventId)
        );
        const noCertEvents = allEvents.filter(
          (e: Event) => !certEventIds.has(e.eventId)
        );
        setOtherEvents(noCertEvents);
      }

      setEventsWithCert(certEventsRes.events);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="heading-3">Events with Certificates</h2>
            {canManageCertificates && (
              <Button
                variant="default"
                onClick={() => setIsConfigDialogOpen(true)}
              >
                Add Certificate Generation for Event
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="heading-3 mb-4">Other Events</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="heading-3">Events with Certificates</h2>
          {canManageCertificates && (
            <Button
              variant="default"
              onClick={() => setIsConfigDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Certificate Generation for Event
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventsWithCert.length === 0 ? (
            <p className="text-muted-foreground">
              No events with certificates.
            </p>
          ) : (
            eventsWithCert.map((event) => {
              const imageSrc = getEventImageSrc(event);
              return (
                <Card
                  key={event.eventId}
                  className="hover:bg-accent/50 flex cursor-pointer flex-col overflow-hidden transition-colors"
                  onClick={() => onEventSelect(event.eventId)}
                >
                  {imageSrc && (
                    <div className="bg-muted h-40 w-full overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={event.eventName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{event.eventName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 min-h-[40px] text-sm">
                      {event.eventDescription || "No description available."}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Other Events</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherEvents.length === 0 ? (
            <p className="text-muted-foreground">No other events available.</p>
          ) : (
            otherEvents.map((event) => {
              const imageSrc = getEventImageSrc(event);
              return (
                <Card
                  key={event.eventId}
                  className="flex flex-col overflow-hidden"
                >
                  {imageSrc && (
                    <div className="bg-muted h-40 w-full overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={event.eventName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{event.eventName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 min-h-[40px] text-sm">
                      {event.eventDescription || "No description available."}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <ConfigureEventDialog
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        onConfigured={fetchData}
        availableEvents={otherEvents}
      />
    </div>
  );
};
