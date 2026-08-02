import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EventsHeader,
  ViewToggle,
  EventsGrid,
  EventsGridSkeleton,
  AddEventModal,
} from "@/features/admin/event-management";

import { getEvents } from "@/features/events/api/eventService";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import type { Event as ApiEvent } from "@/features/events/types/event.types";

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { canManageEvents } = useAdminPermissions();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<ApiEvent[]>([]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const handleManageEvent = (eventId: string) => {
    const getEventId = (event: ApiEvent): string =>
      String(event.eventId ?? event._id ?? "unknown-id");
    const event = events.find((e) => getEventId(e) === eventId);
    if (event) {
      navigate(`/admin/events/${eventId}`, { state: { event } });
    }
  };

  const handleViewStatistics = (eventId: string) => {
    navigate(`/admin/events/${eventId}/statistics`);
  };

  const handleViewRaffle = (eventId: string) => {
    navigate(`/admin/events/${eventId}/raffle`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <EventsHeader
        onAddEvent={
          canManageEvents ? () => setIsAddEventModalOpen(true) : undefined
        }
      />

      <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

      {isLoading ? (
        <EventsGridSkeleton viewMode={viewMode} />
      ) : (
        <EventsGrid
          events={events}
          viewMode={viewMode}
          onManageEvent={handleManageEvent}
          onViewStatistics={handleViewStatistics}
          onViewRaffle={handleViewRaffle}
        />
      )}

      <AddEventModal
        open={isAddEventModalOpen}
        onOpenChange={setIsAddEventModalOpen}
        onSuccess={fetchEvents}
      />
   </div>
  );
};

export default EventsPage;
